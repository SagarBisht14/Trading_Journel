import { stringify } from 'csv-stringify/sync';
import { parse } from 'csv-parse/sync';
import Trade from '../models/Trade.js';
import Journal from '../models/Journal.js';
import Watchlist from '../models/Watchlist.js';
import Goal from '../models/Goal.js';
import Playbook from '../models/Playbook.js';
import Note from '../models/Note.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const collections = [
  ['trades', Trade],
  ['journals', Journal],
  ['watchlist', Watchlist],
  ['goals', Goal],
  ['playbooks', Playbook],
  ['notes', Note]
];

function cleanForImport(row, userId) {
  const doc = { ...row, user: userId };
  delete doc._id;
  delete doc.id;
  delete doc.createdAt;
  delete doc.updatedAt;
  delete doc.__v;
  return doc;
}

export const exportJson = asyncHandler(async (req, res) => {
  const payload = { exportedAt: new Date().toISOString(), version: 1 };
  for (const [key, Model] of collections) {
    payload[key] = await Model.find({ user: req.user._id }).lean();
  }
  res.setHeader('Content-Disposition', 'attachment; filename="trading-journal-backup.json"');
  res.json(payload);
});

export const importJson = asyncHandler(async (req, res) => {
  const counts = {};
  for (const [key, Model] of collections) {
    const records = Array.isArray(req.body[key]) ? req.body[key] : [];
    if (records.length) {
      const inserted = await Model.insertMany(records.map((row) => cleanForImport(row, req.user._id)), { ordered: false });
      counts[key] = inserted.length;
    } else {
      counts[key] = 0;
    }
  }
  res.json({ message: 'Backup imported', counts });
});

export const exportTradesCsv = asyncHandler(async (req, res) => {
  const trades = await Trade.find({ user: req.user._id, deletedAt: null }).lean();
  const rows = trades.map((trade) => ({
    id: trade._id,
    date: trade.tradeDate,
    time: trade.tradeTime,
    instrument: trade.instrument,
    market: trade.market,
    broker: trade.broker,
    strategy: trade.strategy,
    setup: trade.setup,
    timeframe: trade.timeframe,
    direction: trade.direction,
    risk: trade.riskAmount,
    reward: trade.rewardAmount,
    rr: trade.rrRatio,
    pnl: trade.netProfit,
    result: trade.result,
    notes: trade.notes
  }));
  const csv = stringify(rows, { header: true });
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="trades.csv"');
  res.send(csv);
});

export const exportTradesExcel = asyncHandler(async (req, res) => {
  const trades = await Trade.find({ user: req.user._id, deletedAt: null }).lean();
  const columns = ['Date', 'Time', 'Instrument', 'Market', 'Strategy', 'Setup', 'Direction', 'Risk', 'Reward', 'RR', 'PnL', 'Result', 'Notes'];
  const rows = trades.map((trade) => [
    trade.tradeDate ? new Date(trade.tradeDate).toISOString().slice(0, 10) : '',
    trade.tradeTime,
    trade.instrument,
    trade.market,
    trade.strategy,
    trade.setup,
    trade.direction,
    trade.riskAmount,
    trade.rewardAmount,
    trade.rrRatio,
    trade.netProfit,
    trade.result,
    trade.notes
  ]);
  res.setHeader('Content-Type', 'application/vnd.ms-excel');
  res.setHeader('Content-Disposition', 'attachment; filename="trades.xls"');
  res.send(spreadsheetXml(columns, rows));
});

export const importTradesFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Upload a CSV file in the file field');
  const rows = await parseTradeRows(req.file);
  const trades = rows.map((row) =>
    cleanForImport(
      {
        tradeDate: row.tradeDate || row.Date || row.date,
        tradeTime: row.tradeTime || row.Time || row.time || '',
        instrument: row.instrument || row.Instrument,
        market: row.market || row.Market || 'Stocks',
        broker: row.broker || row.Broker || '',
        strategy: row.strategy || row.Strategy || '',
        setup: row.setup || row.Setup || '',
        timeframe: row.timeframe || row.Timeframe || '',
        direction: row.direction || row.Direction || 'Long',
        riskAmount: row.riskAmount || row.Risk || row.risk || 0,
        rewardAmount: row.rewardAmount || row.Reward || row.reward || 0,
        rrRatio: row.rrRatio || row.RR || row.rr || 0,
        netProfit: row.netProfit || row.PnL || row.pnl || 0,
        result: row.result || row.Result || 'Break-even',
        notes: row.notes || row.Notes || ''
      },
      req.user._id
    )
  );
  const inserted = await Trade.insertMany(trades, { ordered: false });
  res.status(201).json({ message: 'Trades imported', count: inserted.length });
});

async function parseTradeRows(file) {
  const filename = String(file.originalname || '').toLowerCase();
  if (filename.endsWith('.csv') || file.mimetype === 'text/csv') {
    return parse(file.buffer.toString('utf8'), {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });
  }

  throw new ApiError(400, 'CSV import supports .csv files. Use the Excel export for spreadsheet review.');
}

function spreadsheetXml(columns, rows) {
  const cell = (value) => {
    const isNumber = typeof value === 'number' && Number.isFinite(value);
    return `<Cell><Data ss:Type="${isNumber ? 'Number' : 'String'}">${escapeXml(value ?? '')}</Data></Cell>`;
  };
  const row = (values) => `<Row>${values.map(cell).join('')}</Row>`;
  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Trades">
    <Table>
      ${row(columns)}
      ${rows.map(row).join('\n')}
    </Table>
  </Worksheet>
</Workbook>`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}
