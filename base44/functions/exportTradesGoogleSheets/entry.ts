import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { google } from 'npm:googleapis@142.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { dateRange } = body; // 'today' or 'all'

    // Get access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googlesheets');

    // Fetch user's transactions
    const transactions = await base44.entities.Transaction.filter(
      { created_by: user.email },
      '-created_date',
      1000
    );

    // Filter by date if needed
    let filteredTransactions = transactions;
    if (dateRange === 'today') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filteredTransactions = transactions.filter(t => {
        const txDate = new Date(t.created_date);
        txDate.setHours(0, 0, 0, 0);
        return txDate.getTime() === today.getTime();
      });
    }

    // Create Google Sheets client
    const sheets = google.sheets({ version: 'v4', auth: new google.auth.OAuth2() });
    sheets.setCredentials({ access_token: accessToken });

    // Create new spreadsheet
    const spreadsheetRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `Trading Export - ${new Date().toISOString().split('T')[0]}`
        }
      }
    });

    const spreadsheetId = spreadsheetRes.data.spreadsheetId;

    // Prepare data
    const headers = ['Date', 'Type', 'Symbol', 'Company', 'Shares', 'Price per Share', 'Total Amount'];
    const rows = filteredTransactions.map(t => [
      new Date(t.created_date).toLocaleString(),
      t.type,
      t.symbol,
      t.company_name,
      t.shares,
      t.price_per_share,
      t.total_amount
    ]);

    // Write data to sheet
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [headers, ...rows]
      }
    });

    // Format header row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [{
          repeatCell: {
            range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
            cell: {
              userEnteredFormat: {
                backgroundColor: { red: 0.2, green: 0.2, blue: 0.8 },
                textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            },
            fields: 'userEnteredFormat'
          }
        }]
      }
    });

    return Response.json({
      spreadsheetId,
      spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      transactionCount: filteredTransactions.length
    });
  } catch (error) {
    console.error('Export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});