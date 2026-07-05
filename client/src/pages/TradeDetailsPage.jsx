import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Modal from '../components/Modal.jsx';
import PageHeader from '../components/PageHeader.jsx';
import api, { assetUrl } from '../services/api.js';
import { currency, dateLabel, minutesLabel, number, pnlClass } from '../utils/formatters.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function TradeDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trade, setTrade] = useState(null);
  const [zoom, setZoom] = useState(null);
  const code = user?.currency || 'USD';

  useEffect(() => {
    async function load() {
      try {
        const { data } = await api.get(`/trades/${id}`);
        setTrade(data.trade);
      } catch (error) {
        toast.error(error.friendlyMessage);
      }
    }
    load();
  }, [id]);

  const remove = async () => {
    await api.delete(`/trades/${id}`);
    toast.success('Trade deleted');
    navigate('/app/trades');
  };

  if (!trade) return <div className="h-96 animate-pulse rounded-lg bg-white/[0.05]" />;

  const stats = [
    ['PnL', currency(trade.netProfit, code), pnlClass(trade.netProfit)],
    ['Risk', currency(trade.riskAmount, code)],
    ['Reward', currency(trade.rewardAmount, code)],
    ['RR', number(trade.rrRatio, 2)],
    ['Fees', currency(trade.fees, code)],
    ['Duration', minutesLabel(trade.tradeDuration)]
  ];

  return (
    <div>
      <PageHeader
        eyebrow="Trade Details"
        title={`${trade.instrument} ${trade.direction}`}
        description={`${dateLabel(trade.tradeDate)} at ${trade.tradeTime || 'session time not set'} · ${trade.strategy || 'No strategy'} · ${trade.setup || 'No setup'}`}
        actions={
          <>
            <Link to="/app/trades" className="btn-secondary"><ArrowLeft className="h-4 w-4" />Back</Link>
            <Link to={`/app/trades/${id}/edit`} className="btn-primary"><Edit className="h-4 w-4" />Edit</Link>
            <button className="btn-danger" onClick={remove}><Trash2 className="h-4 w-4" />Delete</button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {stats.map(([label, value, className]) => (
          <div key={label} className="glass-panel rounded-lg p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{label}</p>
            <p className={`mt-3 text-xl font-semibold ${className || 'text-white'}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="glass-panel rounded-lg p-5">
          <h2 className="section-title">All Trade Information</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ['Market', trade.market],
              ['Broker', trade.broker],
              ['Timeframe', trade.timeframe],
              ['Result', trade.result],
              ['Entry', trade.entryPrice],
              ['Stop Loss', trade.stopLoss],
              ['Take Profit', trade.takeProfit],
              ['Exit', trade.exitPrice],
              ['Position Size', trade.positionSize],
              ['Gross Profit', currency(trade.grossProfit, code)],
              ['Slippage', currency(trade.slippage, code)],
              ['Confidence', `${trade.confidenceRating}/10`],
              ['Sleep', trade.sleepQuality],
              ['Mood', trade.mood]
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg bg-white/[0.04] px-3 py-2">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-1 text-sm font-medium text-slate-100">{value || '-'}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rounded-lg p-5">
          <h2 className="section-title">Image Gallery</h2>
          {trade.screenshots?.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {trade.screenshots.map((image) => (
                <button key={image._id} className="overflow-hidden rounded-lg border border-white/10 bg-panel text-left" onClick={() => setZoom(assetUrl(image.url))}>
                  <img src={assetUrl(image.url)} alt={image.type} className="aspect-video w-full object-cover transition hover:scale-105" loading="lazy" />
                  <div className="p-3 text-sm text-slate-300">{image.type}</div>
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">No screenshots attached.</p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <InfoPanel title="Journal" text={trade.notes} />
        <InfoPanel title="Mistakes" text={trade.mistakeCategory} />
        <InfoPanel title="Lessons" text={trade.lessonsLearned} />
      </div>

      <section className="glass-panel mt-6 rounded-lg p-5">
        <h2 className="section-title">Timeline</h2>
        <div className="mt-4 space-y-3">
          {[
            ['Before trade', trade.emotionBefore || 'No emotion logged'],
            ['During trade', trade.emotionDuring || 'No emotion logged'],
            ['After trade', trade.emotionAfter || 'No emotion logged'],
            ['Review', trade.didFollowPlan ? 'Plan followed' : 'Plan not fully followed']
          ].map(([label, text]) => (
            <div key={label} className="flex gap-3 rounded-lg bg-white/[0.04] p-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-brand" />
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="mt-1 text-sm text-slate-400">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Modal open={Boolean(zoom)} title="Screenshot" onClose={() => setZoom(null)}>
        {zoom && <img src={zoom} alt="Trade screenshot" className="mx-auto max-h-[75vh] rounded-lg object-contain" />}
      </Modal>
    </div>
  );
}

function InfoPanel({ title, text }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="section-title">{title}</h2>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-400">{text || 'Nothing recorded yet.'}</p>
    </section>
  );
}
