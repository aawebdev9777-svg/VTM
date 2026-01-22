import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { google } from 'npm:googleapis@142.0.0';

const SHEET_ID = 'trading_log_master_sheet';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { event, data } = body;

    if (event.type !== 'create' || event.entity_name !== 'Transaction') {
      return Response.json({ success: true });
    }

    try {
      const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');
      const auth = new google.auth.OAuth2();
      auth.setCredentials({ access_token: accessToken });
      const sheets = google.sheets({ version: 'v4', auth });

      let spreadsheetId = Deno.env.get('TRADING_LOG_SHEET_ID');

      if (!spreadsheetId) {
        const spreadsheetRes = await sheets.spreadsheets.create({
          requestBody: {
            properties: { title: 'Trading Log - Master Sheet' }
          }
        });
        spreadsheetId = spreadsheetRes.data.spreadsheetId;

        // Add headers
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!A1',
          valueInputOption: 'RAW',
          requestBody: {
            values: [[
              'Timestamp',
              'User Email',
              'Type',
              'Symbol',
              'Company',
              'Shares',
              'Price per Share',
              'Total Amount'
            ]]
          }
        });
      }

      // Append transaction
      const row = [
        new Date(data.created_date).toISOString(),
        data.created_by,
        data.type,
        data.symbol,
        data.company_name,
        data.shares,
        data.price_per_share,
        data.total_amount
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1',
        valueInputOption: 'RAW',
        requestBody: { values: [row] }
      });
    } catch (sheetError) {
      console.error('Sheet logging failed silently:', sheetError.message);
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('Transaction processing error:', error);
    return Response.json({ success: true });
  }
});