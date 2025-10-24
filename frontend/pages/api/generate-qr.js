// QR Code Generation API Route
import QRCode from 'qrcode';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { 
      report_id, 
      url, 
      format = 'png', 
      size = 200,
      margin = 4,
      color = '#000000',
      background = '#ffffff'
    } = req.query;
    
    if (!report_id && !url) {
      return res.status(400).json({ 
        success: false, 
        message: 'Either report_id or url parameter is required' 
      });
    }
    
    // Determine the data to encode
    const qrData = url || `${process.env.NEXT_PUBLIC_BASE_URL}/report/${report_id}`;
    
    // QR Code generation options
    const options = {
      width: parseInt(size),
      margin: parseInt(margin),
      color: {
        dark: color,
        light: background
      },
      type: format === 'svg' ? 'svg' : 'png'
    };

    let qrResult;
    
    if (format === 'svg') {
      // Generate SVG QR code
      const svgString = await QRCode.toString(qrData, {
        ...options,
        type: 'svg'
      });
      
      qrResult = {
        qr_code_data: svgString,
        qr_code_url: `data:image/svg+xml;base64,${Buffer.from(svgString).toString('base64')}`,
        data: qrData,
        format: 'svg',
        size: `${size}x${size}`
      };
    } else {
      // Generate PNG QR code as base64
      const pngBuffer = await QRCode.toBuffer(qrData, {
        ...options,
        type: 'png'
      });
      
      const base64String = pngBuffer.toString('base64');
      
      qrResult = {
        qr_code_data: base64String,
        qr_code_url: `data:image/png;base64,${base64String}`,
        data: qrData,
        format: 'png',
        size: `${size}x${size}`
      };
    }

    // Set appropriate headers
    if (req.query.download === 'true') {
      res.setHeader('Content-Disposition', `attachment; filename="qr-code-${report_id || 'custom'}.${format}"`);
      res.setHeader('Content-Type', format === 'svg' ? 'image/svg+xml' : 'image/png');
      
      if (format === 'svg') {
        return res.send(qrResult.qr_code_data);
      } else {
        return res.send(Buffer.from(qrResult.qr_code_data, 'base64'));
      }
    }

    res.status(200).json({
      success: true,
      qr_code: qrResult
    });
    
  } catch (error) {
    console.error('QR Generation Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
}
