import { useState } from 'react';
import Layout from '@/components/layout/Layout';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { useRewardProgress, useCreateReward, useUpdateReward } from '@/hooks/useRewards';
import { useTranslation } from '@/hooks/useTranslation';
import type { Reward } from '@/types/reward-types';
import './RewardPage.css';

// 마일스톤 구간 정의
const SEGMENTS = [
  { from: 0, to: 10, tier: 'small' as const },
  { from: 10, to: 30, tier: 'medium' as const },
  { from: 30, to: 100, tier: 'large' as const },
];

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function calcSegmentProgress(completedCount: number, from: number, to: number): number {
  if (completedCount <= from) return 0;
  if (completedCount >= to) return 100;
  return Math.round(((completedCount - from) / (to - from)) * 100);
}

interface RewardFormState {
  title: string;
  description: string;
}

interface EditTarget {
  reward: Reward | null;
  milestone: number;
  tier: 'small' | 'medium' | 'large';
}

// 보드게임 말판 트랙 컴포넌트
interface TrackProps {
  from: number;
  to: number;
  completedCount: number;
  isAchieved: boolean;
  isCurrent: boolean;
}

function BoardTrack({ from, to, completedCount, isAchieved, isCurrent }: TrackProps) {
  const progress = calcSegmentProgress(completedCount, from, to);

  let fillClass = 'fill-none';
  if (isAchieved) {
    fillClass = 'fill-achieved';
  } else if (isCurrent) {
    fillClass = 'fill-current';
  }

  // 말 위치: 트랙 바 위에서 진행률 %로 표시
  const runnerLeft = Math.min(Math.max(progress, 2), 98);
  const showRunner = isCurrent && !isAchieved;

  return (
    <div className="reward-track">
      <div className="reward-track-labels">
        <span className="reward-track-label-start">{from === 0 ? '시작' : from}</span>
        <span className={`reward-track-label-end ${isAchieved ? 'achieved' : ''}`}>
          {isAchieved ? '🏆' : '🏁'} {to}
        </span>
      </div>
      <div className="reward-track-bar-wrapper">
        <div className="reward-track-bar-bg">
          <div
            className={`reward-track-bar-fill ${fillClass}`}
            style={{ width: `${isAchieved ? 100 : progress}%` }}
          />
        </div>
        {showRunner ? (
          <span
            className="reward-track-runner running"
            style={{ left: `${runnerLeft}%` }}
            aria-hidden="true"
          >
            🏃
          </span>
        ) : null}
        {isAchieved ? (
          <span
            className="reward-track-runner"
            style={{ left: '98%' }}
            aria-hidden="true"
          >
            🏆
          </span>
        ) : null}
      </div>
    </div>
  );
}

// 보상 카드 컴포넌트
interface RewardCardProps {
  tier: 'small' | 'medium' | 'large';
  milestone: number;
  reward: Reward | null;
  onEdit: (reward: Reward | null, milestone: number, tier: 'small' | 'medium' | 'large') => void;
}

function RewardCard({ tier, milestone, reward, onEdit }: RewardCardProps) {
  const { t } = useTranslation();

  const tierIcons = { small: '🎁', medium: '🎁', large: '🎁' };
  const tierLabelKey = `reward.${tier}` as const;
  const milestoneKey = `reward.milestone${milestone}` as const;

  const isAchieved = reward?.isAchieved ?? false;

  return (
    <div className={`reward-card ${isAchieved ? 'card-achieved' : ''}`}>
      <div className="reward-card-left">
        <span className="reward-card-icon">{tierIcons[tier]}</span>
        <div className="reward-card-info">
          <div className="reward-card-tier">{t(tierLabelKey)}</div>
          <div className="reward-card-milestone">{t(milestoneKey)}</div>
          {reward ? (
            <>
              <div className="reward-card-content-title">{reward.title}</div>
              {reward.description ? (
                <div className="reward-card-content-desc">{reward.description}</div>
              ) : null}
              {isAchieved ? (
                <>
                  <div className="reward-card-achieved-badge">
                    ✅ {t('reward.achieved')}
                  </div>
                  {reward.achievedAt ? (
                    <div className="reward-card-achieved-date">
                      {formatDate(reward.achievedAt)}
                    </div>
                  ) : null}
                </>
              ) : null}
            </>
          ) : (
            <div className="reward-card-not-set">{t('reward.notSet')}</div>
          )}
        </div>
      </div>
      <div className="reward-card-actions">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onEdit(reward, milestone, tier)}
        >
          {reward ? t('reward.editReward') : t('reward.setReward')}
        </Button>
      </div>
    </div>
  );
}

export default function RewardPage() {
  const { t } = useTranslation();
  const { data, isLoading } = useRewardProgress();
  const createReward = useCreateReward();
  const updateReward = useUpdateReward();

  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [form, setForm] = useState<RewardFormState>({ title: '', description: '' });
  const [titleError, setTitleError] = useState('');

  const progress = data?.data;
  const completedCount = progress?.completedCount ?? 0;
  const rewards = progress?.rewards ?? [];
  const nextMilestone = progress?.nextMilestone ?? null;
  const progressToNext = progress?.progressToNext ?? 0;

  const getRewardByTier = (tier: 'small' | 'medium' | 'large'): Reward | null => {
    return rewards.find((r) => r.tier === tier) ?? null;
  };

  const handleOpenModal = (
    reward: Reward | null,
    milestone: number,
    tier: 'small' | 'medium' | 'large',
  ) => {
    setEditTarget({ reward, milestone, tier });
    setForm({
      title: reward?.title ?? '',
      description: reward?.description ?? '',
    });
    setTitleError('');
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditTarget(null);
    setForm({ title: '', description: '' });
    setTitleError('');
  };

  const handleSave = () => {
    if (!form.title.trim()) {
      setTitleError(t('validation.titleRequired'));
      return;
    }
    if (!editTarget) return;

    const { reward, milestone } = editTarget;

    if (reward) {
      updateReward.mutate(
        {
          id: reward.id,
          data: {
            title: form.title.trim(),
            description: form.description.trim() || null,
          },
        },
        { onSuccess: handleCloseModal },
      );
    } else {
      createReward.mutate(
        {
          milestone,
          title: form.title.trim(),
          description: form.description.trim() || null,
        },
        { onSuccess: handleCloseModal },
      );
    }
  };

  // 각 구간의 달성/현재 상태 계산
  const getSegmentStatus = (from: number, to: number) => {
    const isAchieved = completedCount >= to;
    const isCurrent = !isAchieved && completedCount >= from;
    return { isAchieved, isCurrent };
  };

  const isSaving = createReward.isPending || updateReward.isPending;

  return (
    <Layout>
      <div className="reward-page">
        {/* 페이지 헤더 */}
        <div className="reward-page-header">
          <h1 className="reward-page-title">{t('reward.title')}</h1>
          <p className="reward-page-description">{t('reward.description')}</p>
        </div>

        {isLoading ? (
          <div className="reward-page-loading" role="status">
            {t('common.loading')}
          </div>
        ) : (
          <>
            {/* 통계 */}
            <div className="reward-stats">
              <div className="reward-stat-item">
                <span className="reward-stat-label">{t('reward.completedCount')}</span>
                <span className="reward-stat-value">
                  <span className="reward-stat-value-highlight">{completedCount}</span>
                  {t('reward.completedUnit')}
                </span>
              </div>
              {nextMilestone !== null ? (
                <div className="reward-stat-item">
                  <span className="reward-stat-label">{t('reward.nextGoal')}</span>
                  <span className="reward-stat-value">
                    {t('reward.remaining', { count: progressToNext })}
                  </span>
                </div>
              ) : (
                <div className="reward-stat-item">
                  <span className="reward-stat-value reward-stat-value-highlight">
                    {t('reward.allAchieved')}
                  </span>
                </div>
              )}
            </div>

            {/* 보드게임 말판 */}
            <div className="reward-board">
              <p className="reward-board-title">진행 현황</p>
              <div className="reward-board-tracks">
                {SEGMENTS.map((seg) => {
                  const { isAchieved, isCurrent } = getSegmentStatus(seg.from, seg.to);
                  return (
                    <BoardTrack
                      key={seg.tier}
                      from={seg.from}
                      to={seg.to}
                      completedCount={completedCount}
                      isAchieved={isAchieved}
                      isCurrent={isCurrent}
                    />
                  );
                })}
              </div>
            </div>

            {/* 보상 카드 */}
            <div className="reward-cards">
              {SEGMENTS.map((seg) => (
                <RewardCard
                  key={seg.tier}
                  tier={seg.tier}
                  milestone={seg.to}
                  reward={getRewardByTier(seg.tier)}
                  onEdit={handleOpenModal}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* 보상 설정/수정 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCloseModal}
        title={editTarget?.reward ? t('reward.editReward') : t('reward.setReward')}
      >
        <div className="reward-form">
          <Input
            label={t('reward.rewardTitle')}
            required
            value={form.title}
            placeholder={t('reward.rewardTitlePlaceholder')}
            error={titleError}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, title: e.target.value }));
              if (titleError) setTitleError('');
            }}
          />
          <div className="reward-form-field">
            <label className="reward-form-label">
              {t('reward.rewardDescription')}
            </label>
            <textarea
              className="reward-form-textarea"
              value={form.description}
              placeholder={t('reward.rewardDescriptionPlaceholder')}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="reward-form-actions">
            <Button variant="secondary" onClick={handleCloseModal} disabled={isSaving}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleSave} loading={isSaving}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
}
