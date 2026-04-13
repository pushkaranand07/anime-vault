// GET /api/cron/update-episodes
// Scheduled cron endpoint for automated episode updates
// This should be called every 6-12 hours

import { NextRequest, NextResponse } from 'next/server';
import { updateAllOngoingAnime, getUpdateStatus } from '@/lib/updateService';

// Verify the request is from a trusted cron service
function verifyCronSecret(request: NextRequest): boolean {
  const secret = request.headers.get('x-cron-secret') || 
                 request.headers.get('authorization')?.replace('Bearer ', '');
  
  return secret === process.env.CRON_SECRET;
}

export async function GET(request: NextRequest) {
  try {
    // Verify request
    if (!verifyCronSecret(request)) {
      console.warn('Unauthorized cron request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('🔄 Starting scheduled episode update...');
    const startTime = Date.now();

    // Run update
    const result = await updateAllOngoingAnime();

    const duration = Date.now() - startTime;

    console.log(`✅ Update completed in ${duration}ms`);
    console.log(`   • Updated: ${result.updated} anime`);
    console.log(`   • New episodes: ${result.newEpisodes}`);
    console.log(`   • Failed: ${result.failed}`);

    return NextResponse.json(
      {
        success: true,
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`,
        results: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Cron update failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Optional: GET endpoint to check update status
export async function HEAD(request: NextRequest) {
  try {
    // Quick health check
    const status = await getUpdateStatus(1);
    
    return new Response(null, {
      status: status.recentLogs.length > 0 ? 200 : 201,
      headers: {
        'x-status': 'operational',
        'x-total-updates': status.total.toString(),
      },
    });
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}
