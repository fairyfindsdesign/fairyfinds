import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getAdminSupabase } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Require valid admin authentication to upload files
    const session = request.cookies.get('admin_session');
    if (session?.value !== 'authenticated') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Admin authentication required to upload files.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided in request.' },
        { status: 400 }
      );
    }

    // Sanitize filename
    const originalName = file.name || 'image.webp';
    const ext = originalName.substring(originalName.lastIndexOf('.')) || '.webp';
    const cleanBaseName = originalName
      .substring(0, originalName.lastIndexOf('.'))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'photo';

    const timestamp = Date.now();
    const filename = `${timestamp}-${cleanBaseName}${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 1. Attempt upload to Supabase Storage if configured
    const supabase = getAdminSupabase();
    if (supabase) {
      try {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('boutique-assets')
          .upload(filename, buffer, {
            contentType: file.type || 'image/webp',
            upsert: true,
          });

        if (!uploadError && uploadData) {
          const { data } = supabase.storage
            .from('boutique-assets')
            .getPublicUrl(filename);

          if (data?.publicUrl) {
            return NextResponse.json({
              success: true,
              url: data.publicUrl,
              filename,
              size: file.size,
              storage: 'supabase',
            });
          }
        } else if (uploadError) {
          console.warn('Supabase storage upload error, attempting local fallback:', uploadError.message);
        }
      } catch (sbErr) {
        console.warn('Supabase storage exception, falling back to local:', sbErr);
      }
    }

    // 2. Local filesystem storage fallback (for development & self-hosted)
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, buffer);

      const localUrl = `/uploads/${filename}`;
      return NextResponse.json({
        success: true,
        url: localUrl,
        filename,
        size: file.size,
        storage: 'local',
      });
    } catch (fsErr) {
      console.warn('Local filesystem write failed (read-only environment), falling back to data URL:', fsErr);
    }

    // 3. Fallback to Data URL for serverless environments without cloud bucket
    const mimeType = file.type || 'image/webp';
    const base64Data = buffer.toString('base64');
    const dataUrl = `data:${mimeType};base64,${base64Data}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename,
      size: file.size,
      storage: 'inline',
    });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process file upload.' },
      { status: 500 }
    );
  }
}
