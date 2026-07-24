import React from 'react';
import '../styles/fermentation-progress.css';

interface BrewData {
  startDate?: string;
  primaryEndDate?: string;
  secondaryStartDate?: string;
  secondaryEndDate?: string;
  bottlingDate?: string;
  drinkingReadyDate?: string;
  fermentationTime?: string;
  bulkConditioningTime?: string;
  bottleConditioningTime?: string;
  secondaryTime?: string;
}

interface FermentationProgressProps {
  brewData: BrewData;
}

function daysBetween(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (isNaN(ms) || ms < 0) return null;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function isDateReached(dateStr?: string): boolean {
  if (!dateStr) return false;
  const targetDate = new Date(dateStr);
  const today = new Date();
  return targetDate <= today;
}

function calculateProgressPercent(startStr?: string, endStr?: string): number {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  const now = new Date().getTime();

  if (now >= end) return 100;
  if (now <= start) return 0;

  const total = end - start;
  const elapsed = now - start;
  return Math.round((elapsed / total) * 100);
}

function parseTimeToDays(timeStr?: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)\s*(month|week|day)s?/i);
  if (!match) return 0;
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 'month': return amount * 30;
    case 'week': return amount * 7;
    case 'day': return amount;
    default: return 0;
  }
}

function addDaysToDate(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

interface Stage {
  label: string;
  days: number | null;
  completed: boolean;
  active: boolean;
}

const FermentationProgress: React.FC<FermentationProgressProps> = ({ brewData }) => {
  const today = new Date().toISOString().split('T')[0];

  const primaryEndDate = brewData.primaryEndDate;
  const secondaryStartDate = brewData.secondaryStartDate;
  const secondaryEndDate = brewData.secondaryEndDate;
  const bottlingDate = brewData.bottlingDate;

  // Calculate planned dates from time strings
  const plannedPrimaryEndDate = brewData.startDate && brewData.fermentationTime
    ? addDaysToDate(brewData.startDate, parseTimeToDays(brewData.fermentationTime))
    : undefined;

  const plannedSecondaryEndDate = (secondaryStartDate || plannedPrimaryEndDate) && brewData.secondaryTime
    ? addDaysToDate(secondaryStartDate || plannedPrimaryEndDate || today, parseTimeToDays(brewData.secondaryTime))
    : undefined;

  const plannedBulkConditioningEnd = (secondaryStartDate || plannedSecondaryEndDate) && brewData.bulkConditioningTime
    ? addDaysToDate(plannedSecondaryEndDate || secondaryStartDate || today, parseTimeToDays(brewData.bulkConditioningTime))
    : undefined;

  const plannedBottleConditioningEnd = bottlingDate && brewData.bottleConditioningTime
    ? addDaysToDate(bottlingDate, parseTimeToDays(brewData.bottleConditioningTime))
    : undefined;

  const calculatedDrinkingReadyDate = brewData.drinkingReadyDate || plannedBottleConditioningEnd;

  // Stage completion status
  const primaryCompleted = !!primaryEndDate || isDateReached(plannedPrimaryEndDate);
  const secondaryCompleted = !!secondaryEndDate || isDateReached(plannedSecondaryEndDate) || !!bottlingDate;
  const bulkConditioningCompleted = isDateReached(plannedBulkConditioningEnd) || !!bottlingDate;
  const bottledCompleted = !!bottlingDate;
  const bottleConditioningCompleted = !!calculatedDrinkingReadyDate && isDateReached(calculatedDrinkingReadyDate);

  // Active stage status
  const primaryActive = !primaryCompleted && !!brewData.startDate;
  const secondaryActive = primaryCompleted && !secondaryCompleted;
  const bulkConditioningActive = secondaryCompleted && !bulkConditioningCompleted && !!brewData.bulkConditioningTime;
  const bottleConditioningActive = !!bottlingDate && !!calculatedDrinkingReadyDate && !isDateReached(calculatedDrinkingReadyDate);

  // Days for display
  const primaryDays = daysBetween(brewData.startDate, primaryEndDate || plannedPrimaryEndDate);
  const secondaryDays = daysBetween(secondaryStartDate || plannedPrimaryEndDate, secondaryEndDate || plannedSecondaryEndDate || plannedBulkConditioningEnd);
  const bulkConditioningDays = parseTimeToDays(brewData.bulkConditioningTime);
  const bottleConditioningDays = parseTimeToDays(brewData.bottleConditioningTime);

  // Calculate progress percentages for active stages
  const primaryProgress = primaryActive
    ? calculateProgressPercent(brewData.startDate, primaryEndDate || plannedPrimaryEndDate)
    : 0;
  const secondaryProgress = secondaryActive
    ? calculateProgressPercent(secondaryStartDate, secondaryEndDate || plannedSecondaryEndDate || plannedBulkConditioningEnd)
    : 0;
  const bulkConditioningProgress = bulkConditioningActive
    ? calculateProgressPercent(plannedSecondaryEndDate || secondaryEndDate, plannedBulkConditioningEnd)
    : 0;
  const bottleConditioningProgress = bottleConditioningActive
    ? calculateProgressPercent(bottlingDate, calculatedDrinkingReadyDate)
    : 0;

  const daysRemaining = calculatedDrinkingReadyDate ? daysBetween(today, calculatedDrinkingReadyDate) : null;

  // Build stages array
  const stages: Stage[] = [];

  if (brewData.startDate) {
    stages.push({
      label: 'Primary',
      days: primaryDays,
      completed: primaryCompleted,
      active: primaryActive,
    });
  }

  if (brewData.secondaryTime) {
    stages.push({
      label: 'Secondary',
      days: secondaryDays,
      completed: secondaryCompleted,
      active: secondaryActive,
    });
  }

  if (brewData.bulkConditioningTime) {
    stages.push({
      label: 'Bulk Conditioning',
      days: bulkConditioningDays || null,
      completed: bulkConditioningCompleted,
      active: bulkConditioningActive,
    });
  }

  stages.push({
    label: 'Bottled',
    days: null,
    completed: bottledCompleted,
    active: false,
  });

  if (brewData.bottleConditioningTime) {
    stages.push({
      label: 'Bottle Conditioning',
      days: bottleConditioningDays || null,
      completed: bottleConditioningCompleted,
      active: bottleConditioningActive,
    });
  }

  if (calculatedDrinkingReadyDate) {
    stages.push({
      label: 'Ready to Drink',
      days: null,
      completed: bottleConditioningCompleted,
      active: false,
    });
  }

  const totalDays = calculatedDrinkingReadyDate && brewData.startDate
    ? daysBetween(brewData.startDate, calculatedDrinkingReadyDate)
    : null;

  return (
    <div className="fermentation-progress">
      <p className="fermentation-progress-title">Brewing Progress</p>

      <div className="fermentation-progress-track">
        {/* Segmented bar */}
        <div className="fermentation-progress-bar">
          {stages.map((stage, index) => {
            const isActive = stage.active;
            const isCompleted = stage.completed;
            const isPending = !isCompleted && !isActive;

            // Get progress percentage for active stage
            let segmentFill = '50%';
            if (isActive) {
              if (stage.label === 'Primary') segmentFill = `${primaryProgress}%`;
              else if (stage.label === 'Secondary') segmentFill = `${secondaryProgress}%`;
              else if (stage.label === 'Bulk Conditioning') segmentFill = `${bulkConditioningProgress}%`;
              else if (stage.label === 'Bottle Conditioning') segmentFill = `${bottleConditioningProgress}%`;
            }

            return (
              <div
                key={index}
                className={`ferment-segment${isCompleted ? ' completed' : ''}${isActive ? ' active' : ''}${isPending ? ' pending' : ''}`}
                style={isActive ? { '--segment-fill': segmentFill } as React.CSSProperties : undefined}
              />
            );
          })}
        </div>

        {/* Labels */}
        <div className="fermentation-progress-labels">
          {stages.map((stage, index) => {
            const showDaysRemaining = stage.active && daysRemaining && daysRemaining > 0;

            return (
              <div key={index} className={`ferment-label${stage.completed ? ' completed' : ''}${stage.active ? ' active' : ''}`}>
                <div className="ferment-label-text">{stage.label}</div>
                {stage.days !== null && (
                  <div className="ferment-label-days">
                    {showDaysRemaining ? `${daysRemaining} days left` : `${stage.days} days`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {totalDays !== null && (
        <div className="fermentation-progress-total">
          <span>Total:</span>
          <span className="fermentation-progress-total-value">{totalDays} days</span>
        </div>
      )}
    </div>
  );
};

export default FermentationProgress;
