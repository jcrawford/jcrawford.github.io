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
  const todayStr = new Date().toISOString().split('T')[0];

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

  const bulkConditioningTimeDays = parseTimeToDays(brewData.bulkConditioningTime);
  const bottleConditioningTimeDays = parseTimeToDays(brewData.bottleConditioningTime);

  const plannedBulkConditioningEnd = (secondaryEndDate || secondaryStartDate || plannedSecondaryEndDate) && bulkConditioningTimeDays > 0
    ? addDaysToDate(secondaryEndDate || plannedSecondaryEndDate || secondaryStartDate || todayStr, bulkConditioningTimeDays)
    : undefined;

  const plannedBottleConditioningEnd = bottlingDate && bottleConditioningTimeDays > 0
    ? addDaysToDate(bottlingDate, bottleConditioningTimeDays)
    : undefined;

  const calculatedDrinkingReadyDate = brewData.drinkingReadyDate || plannedBottleConditioningEnd || bottlingDate;

  // Stage completion status
  const primaryCompleted = !!primaryEndDate || isDateReached(plannedPrimaryEndDate);
  const secondaryCompleted = !!secondaryEndDate || isDateReached(plannedSecondaryEndDate) || !!bottlingDate;
  const bulkConditioningCompleted = isDateReached(plannedBulkConditioningEnd) || !!bottlingDate;
  const bottledCompleted = !!bottlingDate;
  const bottleConditioningCompleted = !!calculatedDrinkingReadyDate && isDateReached(calculatedDrinkingReadyDate);

  // Active stage status
  const primaryActive = !primaryCompleted && !!brewData.startDate;
  const secondaryActive = primaryCompleted && !secondaryCompleted;
  const bulkConditioningActive = secondaryCompleted && !bulkConditioningCompleted && bulkConditioningTimeDays > 0;
  const bottleConditioningActive = bottlingDate && !bottledCompleted && bottleConditioningTimeDays > 0 && !isDateReached(calculatedDrinkingReadyDate);

  // Days for display
  const primaryDays = daysBetween(brewData.startDate, primaryEndDate || plannedPrimaryEndDate);
  const secondaryDays = daysBetween(secondaryStartDate || plannedPrimaryEndDate, secondaryEndDate || plannedSecondaryEndDate || plannedBulkConditioningEnd);
  const bulkConditioningDays = bulkConditioningTimeDays > 0 ? bulkConditioningTimeDays : null;
  const bottleConditioningDays = bottleConditioningTimeDays > 0 ? bottleConditioningTimeDays : null;

  // Calculate progress percentages for active stages AND elapsed days
  const primaryProgress = primaryActive
    ? calculateProgressPercent(brewData.startDate, primaryEndDate || plannedPrimaryEndDate)
    : 0;
  const primaryElapsedDays = primaryActive && brewData.startDate
    ? daysBetween(brewData.startDate, todayStr)
    : primaryDays;

  const secondaryProgress = secondaryActive
    ? calculateProgressPercent(secondaryStartDate, secondaryEndDate || plannedSecondaryEndDate || plannedBulkConditioningEnd)
    : 0;
  const secondaryElapsedDays = secondaryActive && (secondaryStartDate || plannedPrimaryEndDate)
    ? daysBetween(secondaryStartDate || plannedPrimaryEndDate || todayStr, todayStr)
    : secondaryDays;

  const bulkConditioningProgress = bulkConditioningActive
    ? calculateProgressPercent(secondaryEndDate || plannedSecondaryEndDate, plannedBulkConditioningEnd)
    : 0;
  const bulkConditioningElapsedDays = bulkConditioningActive && (secondaryEndDate || plannedSecondaryEndDate)
    ? daysBetween(secondaryEndDate || plannedSecondaryEndDate || todayStr, todayStr)
    : bulkConditioningDays;

  const bottleConditioningProgress = bottleConditioningActive
    ? calculateProgressPercent(bottlingDate, calculatedDrinkingReadyDate)
    : 0;
  const bottleConditioningElapsedDays = bottleConditioningActive && bottlingDate
    ? daysBetween(bottlingDate, todayStr)
    : bottleConditioningDays;

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
      endDate: secondaryEndDate || plannedSecondaryEndDate || plannedBulkConditioningEnd,
    });
  }

  if (bulkConditioningTimeDays > 0) {
    stages.push({
      label: 'Bulk Conditioning',
      days: bulkConditioningDays || null,
      completed: bulkConditioningCompleted,
      active: bulkConditioningActive,
      elapsedDays: bulkConditioningActive ? bulkConditioningElapsedDays || 0 : bulkConditioningDays || 0,
      totalDays: bulkConditioningDays || 0,
      startDate: secondaryEndDate || plannedSecondaryEndDate,
      endDate: plannedBulkConditioningEnd,
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

  if (bottleConditioningTimeDays > 0) {
    stages.push({
      label: 'Bottle Conditioning',
      days: bottleConditioningDays || null,
      completed: bottleConditioningCompleted,
      active: bottleConditioningActive,
      elapsedDays: bottleConditioningActive ? bottleConditioningElapsedDays || 0 : bottleConditioningDays || 0,
      totalDays: bottleConditioningDays || 0,
      startDate: bottlingDate,
      endDate: calculatedDrinkingReadyDate,
    });
  }

  if (calculatedDrinkingReadyDate) {
    stages.push({
      label: 'Ready to Drink',
      days: null,
      completed: bottleConditioningCompleted,
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
            const elapsed = stage.active ? (stage.elapsedDays || 0) : (stage.completed ? (stage.totalDays || 0) : 0);
            const total = stage.totalDays || stage.days || 0;
            const showDays = stage.label !== 'Bottled' && stage.label !== 'Ready to Drink';

            return (
              <div key={index} className={`ferment-label${stage.completed ? ' completed' : ''}${stage.active ? ' active' : ''}`}>
                <div className="ferment-label-text">{stage.label}</div>
                {showDays && (
                  <div className="ferment-label-days">
                    {elapsed} / {total} days
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
