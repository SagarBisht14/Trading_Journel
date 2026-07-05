import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader.jsx';
import TradeForm from '../components/TradeForm.jsx';
import api from '../services/api.js';

export default function AddTradePage() {
  const { id } = useParams();
  const [trade, setTrade] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const { data } = await api.get(`/trades/${id}`);
        setTrade(data.trade);
      } catch (error) {
        toast.error(error.friendlyMessage);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div>
      <PageHeader
        eyebrow={id ? 'Edit Trade' : 'Add Trade'}
        title={id ? 'Update trade record' : 'Log a new trade'}
        description="Capture execution, risk, emotions, mistakes, lessons, and screenshots in one review-ready entry."
      />
      {loading ? <div className="h-96 animate-pulse rounded-lg bg-white/[0.05]" /> : <TradeForm mode={id ? 'edit' : 'create'} trade={trade} />}
    </div>
  );
}
