import React from 'react';
import '../styles/fermentation-progress.css';

interface BrewData {
  startDate?: string;
  primaryEndDate?: string;
  secondaryStartDate?: string;
  secondaryEndDate?: string;
  bulkConditioningStartDate?: string;
  bottlingDate?: string;
  drinkingReadyDate?: string;
  fermentationTime?: string;
  secondaryTime?: string;
  bulkConditioningTime?: string;
  bottleAgingTime?: string;
}

interface FermentationProgressProps {
  brewData: BrewData;
}

function daysBetween(start?: string, end?: string): number | null {
  if (!start || !end) return null;
  const ms = new Date(end + 'T00:00:00').getTime() - new Date(start + 'T00:00:00').getTime();
  if (isNaN(ms) || ms < 0) return null;
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function isDateReached(dateStr?: string): boolean {
  if (!dateStr) return false;
  const targetDate = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return targetDate <= today;
}

function calculateProgressPercent(startStr?: string, endStr?: string): number {
  if (!startStr || !endStr) return 0;
  const start = new Date(startStr + 'T00:00:00').getTime();
  const end = new Date(endStr + 'T00:00:00').getTime();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const nowTs = now.getTime();

  if (nowTs >= end) return 100;
  if (nowTs <= start) return 0;

  const total = end - start;
  const elapsed = nowTs - start;
  return Math.round((elapsed / total) * 100);
}

function parseTimeToDays(timeStr?: string): number {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+)\s*(year|month|week|day)s?/i);
  if (!match) return 0;
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  switch (unit) {
    case 'year': return amount * 365;
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
  elapsedDays?: number;
  totalDays?: number;
  startDate?: string;
  endDate?: string;
}

const FermentationProgress: React.FC<FermentationProgressProps> = ({ brewData }) => {
  const todayStr = new Date().toLocaleDateString('en-CA');

  const primaryEndDate = brewData.primaryEndDate;
  const secondaryStartDate = brewData.secondaryStartDate;
  const secondaryEndDate = brewData.secondaryEndDate;
  const bottlingDate = brewData.bottlingDate;

  // Calculate planned dates from time strings
  const plannedPrimaryEndDate = brewData.startDate && brewData.fermentationTime
    ? addDaysToDate(brewData.startDate, parseTimeToDays(brewData.fermentationTime))
    : undefined;

  const plannedSecondaryEndDate = (secondaryStartDate || plannedPrimaryEndDate) && brewData.secondaryTime
    ? addDaysToDate(secondaryStartDate || plannedPrimaryEndDate || todayStr, parseTimeToDays(brewData.secondaryTime))
    : undefined;

  const plannedBulkConditioningEndDate = (secondaryEndDate || plannedSecondaryEndDate) && brewData.bulkConditioningTime
    ? addDaysToDate(secondaryEndDate || plannedSecondaryEndDate || todayStr, parseTimeToDays(brewData.bulkConditioningTime))
    : undefined;

  const bottleAgingTimeDays = parseTimeToDays(brewData.bottleAgingTime);

  const plannedBottleAgingEnd = bottlingDate && bottleAgingTimeDays > 0
    ? addDaysToDate(bottlingDate, bottleAgingTimeDays)
    : undefined;

  const calculatedDrinkingReadyDate = brewData.drinkingReadyDate || plannedBottleAgingEnd || bottlingDate;

  // Stage completion status — only true when the corresponding end date is today or in the past
  const primaryCompleted = isDateReached(primaryEndDate || plannedPrimaryEndDate);
  const secondaryCompleted = isDateReached(secondaryEndDate || plannedSecondaryEndDate);
  const bulkConditioningCompleted = isDateReached(bottlingDate) || (brewData.bulkConditioningTime ? isDateReached(plannedBulkConditioningEndDate) : false);
  const bottledCompleted = isDateReached(bottlingDate);
  const bottleAgingCompleted = isDateReached(calculatedDrinkingReadyDate);

  // Active stage status — a stage is active when previous is complete AND this stage's end date is NOT yet reached
  const primaryActive = isDateReached(brewData.startDate) && !primaryCompleted;
  const secondaryActive = primaryCompleted && !secondaryCompleted && !isDateReached(bottlingDate);
  const bulkConditioningActive = secondaryCompleted && !bulkConditioningCompleted && brewData.bulkConditioningTime && !isDateReached(bottlingDate);
  const bottleAgingActive = bottledCompleted && !bottleAgingCompleted && bottleAgingTimeDays > 0 && !isDateReached(calculatedDrinkingReadyDate);

  // Days for display
  const primaryDays = daysBetween(brewData.startDate, primaryEndDate || plannedPrimaryEndDate);
  const secondaryDays = daysBetween(secondaryStartDate || plannedPrimaryEndDate, secondaryEndDate || plannedSecondaryEndDate);
  const bulkConditioningDays = brewData.bulkConditioningTime ? parseTimeToDays(brewData.bulkConditioningTime) : null;
  const bottleAgingDays = bottleAgingTimeDays > 0 ? bottleAgingTimeDays : null;

  // Calculate progress percentages for active stages AND elapsed days
  const primaryProgress = primaryActive
    ? calculateProgressPercent(brewData.startDate, primaryEndDate || plannedPrimaryEndDate)
    : 0;
  const primaryElapsedDays = primaryActive && brewData.startDate
    ? (daysBetween(brewData.startDate, todayStr) ?? 0) + 1
    : primaryDays;

  const secondaryProgress = secondaryActive && (secondaryStartDate || plannedPrimaryEndDate)
    ? calculateProgressPercent(secondaryStartDate || plannedPrimaryEndDate || todayStr, secondaryEndDate || plannedSecondaryEndDate)
    : 0;
  const secondaryElapsedDays = secondaryActive && (secondaryStartDate || plannedPrimaryEndDate)
    ? (daysBetween(secondaryStartDate || plannedPrimaryEndDate || todayStr, todayStr) ?? 0) + 1
    : secondaryDays;

  const bottleAgingProgress = bottleAgingActive
    ? calculateProgressPercent(bottlingDate, calculatedDrinkingReadyDate)
    : 0;
  const bottleAgingElapsedDays = bottleAgingActive && bottlingDate
    ? (daysBetween(bottlingDate, todayStr) ?? 0) + 1
    : bottleAgingDays;

  const bulkConditioningProgress = bulkConditioningActive && (secondaryEndDate || plannedSecondaryEndDate)
    ? calculateProgressPercent(secondaryEndDate || plannedSecondaryEndDate || todayStr, plannedBulkConditioningEndDate || bottlingDate)
    : 0;
  const bulkConditioningElapsedDays = bulkConditioningActive && (secondaryEndDate || plannedSecondaryEndDate)
    ? (daysBetween(secondaryEndDate || plannedSecondaryEndDate || todayStr, todayStr) ?? 0) + 1
    : bulkConditioningDays;

  // Build stages array with tooltip data
  const stages: Stage[] = [];

  if (brewData.startDate) {
    stages.push({
      label: 'Primary',
      days: primaryDays,
      completed: primaryCompleted,
      active: primaryActive,
      elapsedDays: primaryActive ? primaryElapsedDays || 0 : primaryDays || 0,
      totalDays: primaryDays || 0,
      startDate: brewData.startDate,
      endDate: primaryEndDate || plannedPrimaryEndDate,
    });
  }

  if (brewData.secondaryTime) {
    stages.push({
      label: 'Secondary',
      days: secondaryDays,
      completed: secondaryCompleted,
      active: secondaryActive,
      elapsedDays: secondaryActive ? secondaryElapsedDays || 0 : secondaryDays || 0,
      totalDays: secondaryDays || 0,
      startDate: secondaryStartDate || plannedPrimaryEndDate,
      endDate: secondaryEndDate || plannedSecondaryEndDate,
    });
  }

  if (brewData.bulkConditioningTime) {
    stages.push({
      label: 'Bulk Conditioning',
      days: bulkConditioningDays,
      completed: !!bulkConditioningCompleted,
      active: !!bulkConditioningActive,
      elapsedDays: bulkConditioningActive ? bulkConditioningElapsedDays || 0 : bulkConditioningDays || 0,
      totalDays: bulkConditioningDays || 0,
      startDate: secondaryEndDate || plannedSecondaryEndDate,
      endDate: plannedBulkConditioningEndDate || bottlingDate,
    });
  }

  stages.push({
    label: 'Bottled',
    days: null,
    completed: bottledCompleted,
    active: false,
    elapsedDays: bottledCompleted ? 0 : 0,
    totalDays: 0,
  });

  if (bottleAgingTimeDays > 0) {
    stages.push({
      label: 'Bottle Conditioning',
      days: bottleAgingDays || null,
      completed: bottleAgingCompleted,
      active: bottleAgingActive,
      elapsedDays: bottleAgingActive ? bottleAgingElapsedDays || 0 : bottleAgingDays || 0,
      totalDays: bottleAgingDays || 0,
      startDate: bottlingDate,
      endDate: calculatedDrinkingReadyDate,
    });
  }

  if (calculatedDrinkingReadyDate) {
    stages.push({
      label: 'Ready to Drink',
      days: null,
      completed: bottleAgingCompleted,
      active: false,
      elapsedDays: 0,
      totalDays: 0,
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
              else if (stage.label === 'Bottle Conditioning') segmentFill = `${bottleAgingProgress}%`;
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
            const total = stage.totalDays || stage.days || 0;
            const showDays = stage.label !== 'Bottled' && stage.label !== 'Ready to Drink' && total > 0;

            // Active: "X / Y days", Completed: "Y days", Pending: "Y days" (no "0 /")
            const daysDisplay = stage.active
              ? `${stage.elapsedDays || 0} / ${total} days`
              : `${total} days`;

            return (
              <div key={index} className={`ferment-label${stage.completed ? ' completed' : ''}${stage.active ? ' active' : ''}${!stage.completed && !stage.active ? ' pending' : ''}`}>
                <div className="ferment-label-text">{stage.label}</div>
                {showDays && (
                  <div className="ferment-label-days">
                    {daysDisplay}
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
