import { Save } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';
import { defaultTrade, directionOptions, marketOptions, moods, resultOptions, timeframes } from '../utils/tradeOptions.js';
import ImageUploader from './ImageUploader.jsx';

const draftKey = 'tradepilot_trade_draft';

export default function TradeForm({ mode = 'create', trade }) {
  const navigate = useNavigate();
  const initial = useMemo(() => normalizeInitial(trade), [trade]);
  const { register, handleSubmit, reset, watch, setValue, formState: { isSubmitting } } = useForm({ defaultValues: initial });
  const [files, setFiles] = useState([]);

  useEffect(() => {
    reset(initial);
  }, [initial, reset]);

  useEffect(() => {
    if (mode === 'create') {
      const saved = localStorage.getItem(draftKey);
      if (saved) reset({ ...defaultTrade, ...JSON.parse(saved) });
    }
  }, [mode, reset]);

  useEffect(() => {
    if (mode !== 'create') return undefined;
    const subscription = watch((value) => {
      localStorage.setItem(draftKey, JSON.stringify(value));
    });
    return () => subscription.unsubscribe();
  }, [mode, watch]);

  const entry = Number(watch('entryPrice') || 0);
  const stop = Number(watch('stopLoss') || 0);
  const target = Number(watch('takeProfit') || 0);
  const position = Number(watch('positionSize') || 0);
  const direction = watch('direction');
  const riskAmount = watch('riskAmount');
  const rewardAmount = watch('rewardAmount');
  const exitPrice = watch('exitPrice');
  const feesValue = watch('fees');
  const slippageValue = watch('slippage');

  useEffect(() => {
    if (entry && stop && position) setValue('riskAmount', Math.abs(entry - stop) * Math.abs(position), { shouldDirty: true });
    if (entry && target && position) setValue('rewardAmount', Math.abs(target - entry) * Math.abs(position), { shouldDirty: true });
  }, [entry, stop, target, position, setValue]);

  useEffect(() => {
    const risk = Number(riskAmount || 0);
    const reward = Number(rewardAmount || 0);
    if (risk && reward) setValue('rrRatio', Number((reward / risk).toFixed(2)), { shouldDirty: true });
  }, [riskAmount, rewardAmount, setValue]);

  useEffect(() => {
    const exit = Number(exitPrice || 0);
    const fees = Number(feesValue || 0);
    const slippage = Number(slippageValue || 0);
    if (entry && exit && position) {
      const multiplier = direction === 'Short' ? -1 : 1;
      const gross = Number(((exit - entry) * Math.abs(position) * multiplier).toFixed(2));
      setValue('grossProfit', gross, { shouldDirty: true });
      setValue('netProfit', Number((gross - fees - slippage).toFixed(2)), { shouldDirty: true });
    }
  }, [direction, entry, exitPrice, feesValue, position, setValue, slippageValue]);

  const onSubmit = async (values) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) formData.append(key, value);
    });
    files.forEach((item) => formData.append('images', item.file));
    formData.append('imageTypes', JSON.stringify(files.map((item) => item.type)));

    try {
      const { data } =
        mode === 'edit'
          ? await api.put(`/trades/${trade._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
          : await api.post('/trades', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      localStorage.removeItem(draftKey);
      toast.success(mode === 'edit' ? 'Trade updated' : 'Trade saved');
      navigate(`/app/trades/${data.trade._id}`);
    } catch (error) {
      toast.error(error.friendlyMessage);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <FormSection title="Trade Identity">
        <Field label="Trade Date" type="date" required register={register('tradeDate', { required: true })} />
        <Field label="Trade Time" type="time" register={register('tradeTime')} />
        <Field label="Instrument" required register={register('instrument', { required: true })} placeholder="AAPL, EURUSD, BTCUSDT" />
        <Select label="Market" register={register('market', { required: true })} options={marketOptions} />
        <Field label="Broker" register={register('broker')} />
        <Field label="Strategy" register={register('strategy')} />
        <Field label="Setup" register={register('setup')} />
        <Select label="Timeframe" register={register('timeframe')} options={timeframes} />
        <Select label="Direction" register={register('direction')} options={directionOptions} />
      </FormSection>

      <FormSection title="Execution & Risk">
        <Field label="Entry Price" type="number" step="any" register={register('entryPrice')} />
        <Field label="Stop Loss" type="number" step="any" register={register('stopLoss')} />
        <Field label="Take Profit" type="number" step="any" register={register('takeProfit')} />
        <Field label="Exit Price" type="number" step="any" register={register('exitPrice')} />
        <Field label="Position Size" type="number" step="any" register={register('positionSize')} />
        <Field label="Risk ($)" type="number" step="any" register={register('riskAmount')} />
        <Field label="Reward ($)" type="number" step="any" register={register('rewardAmount')} />
        <Field label="RR Ratio" type="number" step="any" register={register('rrRatio')} />
        <Field label="Fees" type="number" step="any" register={register('fees')} />
        <Field label="Slippage" type="number" step="any" register={register('slippage')} />
        <Field label="Gross Profit" type="number" step="any" register={register('grossProfit')} />
        <Field label="Net Profit" type="number" step="any" register={register('netProfit')} />
        <Field label="Trade Duration (minutes)" type="number" step="1" register={register('tradeDuration')} />
        <Select label="Result" register={register('result')} options={resultOptions} />
      </FormSection>

      <FormSection title="Psychology & Review">
        <Select label="Emotion Before Trade" register={register('emotionBefore')} options={['', ...moods]} />
        <Select label="Emotion During Trade" register={register('emotionDuring')} options={['', ...moods]} />
        <Select label="Emotion After Trade" register={register('emotionAfter')} options={['', ...moods]} />
        <Field label="Confidence Rating (1-10)" type="number" min="1" max="10" register={register('confidenceRating')} />
        <Field label="Mistake Category" register={register('mistakeCategory')} placeholder="FOMO, late exit, oversized..." />
        <Field label="Sleep Quality" register={register('sleepQuality')} />
        <Field label="Mood" register={register('mood')} />
      </FormSection>

      <section className="glass-panel rounded-lg p-5">
        <h2 className="section-title">Execution Checklist</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['didFollowPlan', 'Did I Follow My Plan?'],
            ['wasEntryValid', 'Was Entry Valid?'],
            ['wasExitValid', 'Was Exit Valid?'],
            ['didRevengeTrade', 'Did I Revenge Trade?'],
            ['wasNewsInvolved', 'Was News Involved?']
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-3 text-sm text-slate-200">
              <input type="checkbox" className="h-4 w-4 accent-brand" {...register(key)} />
              {label}
            </label>
          ))}
        </div>
      </section>

      <section className="glass-panel rounded-lg p-5">
        <h2 className="section-title">Journal</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TextArea label="Lessons Learned" register={register('lessonsLearned')} />
          <TextArea label="Trade Notes" register={register('notes')} />
        </div>
      </section>

      <section className="glass-panel rounded-lg p-5">
        <h2 className="section-title">Screenshot Upload</h2>
        <p className="mt-1 text-sm text-slate-500">Before entry, after entry, exit, TradingView, MT5, and broker screenshots are supported.</p>
        <div className="mt-4">
          <ImageUploader files={files} setFiles={setFiles} />
        </div>
      </section>

      <div className="sticky bottom-4 z-20 flex justify-end">
        <button className="btn-primary shadow-glow" disabled={isSubmitting}>
          <Save className="h-4 w-4" />
          {mode === 'edit' ? 'Update trade' : 'Save trade'}
        </button>
      </div>
    </form>
  );
}

function normalizeInitial(trade) {
  if (!trade) return defaultTrade;
  const copy = { ...defaultTrade, ...trade };
  if (copy.tradeDate) copy.tradeDate = String(copy.tradeDate).slice(0, 10);
  return copy;
}

function FormSection({ title, children }) {
  return (
    <section className="glass-panel rounded-lg p-5">
      <h2 className="section-title">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}

function Field({ label, register, ...props }) {
  return (
    <div>
      <label className="label">{label}</label>
      <input className="input" {...register} {...props} />
    </div>
  );
}

function Select({ label, register, options }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select className="input" {...register}>
        {options.map((option) => <option key={option} value={option}>{option || 'Select'}</option>)}
      </select>
    </div>
  );
}

function TextArea({ label, register }) {
  return (
    <div>
      <label className="label">{label}</label>
      <textarea className="input min-h-[150px] resize-y" {...register} />
    </div>
  );
}
