import { useState } from 'react';
import { useDailyCalendar } from '@/hooks/useDailyTodos';
import { useTranslation } from '@/hooks/useTranslation';
import type { DailyTodo } from '@/types/daily-todo-types';
import './DailyCalendar.css';

interface DailyCalendarProps {
  onDateSelect: (date: string, todos: DailyTodo[]) => void;
}

function getTodayString(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getTodosForDate(todos: DailyTodo[], date: string): DailyTodo[] {
  return todos.filter((t) => t.startDate <= date && t.dueDate >= date);
}

export default function DailyCalendar({ onDateSelect }: DailyCalendarProps) {
  const { t } = useTranslation();
  const today = getTodayString();

  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string>(today);

  const { data } = useDailyCalendar(currentYear, currentMonth);
  const todos: DailyTodo[] = data?.data ?? [];

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleDateClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    onDateSelect(dateStr, getTodosForDate(todos, dateStr));
  };

  // 달력 날짜 계산
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const startDow = firstDayOfMonth.getDay(); // 0=일
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  // 앞쪽 빈 칸
  const emptyCells = Array.from({ length: startDow });
  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const weekdays = [
    t('calendar.sun'),
    t('calendar.mon'),
    t('calendar.tue'),
    t('calendar.wed'),
    t('calendar.thu'),
    t('calendar.fri'),
    t('calendar.sat'),
  ];

  const monthTitle = `${currentYear}년 ${String(currentMonth).padStart(2, '0')}월`;

  return (
    <div className="daily-calendar" data-testid="daily-calendar">
      <div className="daily-calendar-header">
        <button
          type="button"
          className="daily-calendar-nav-btn"
          onClick={handlePrevMonth}
          aria-label={t('calendar.prevMonth')}
        >
          &#9664;
        </button>
        <span className="daily-calendar-title">{monthTitle}</span>
        <button
          type="button"
          className="daily-calendar-nav-btn"
          onClick={handleNextMonth}
          aria-label={t('calendar.nextMonth')}
        >
          &#9654;
        </button>
      </div>

      <div className="daily-calendar-grid" role="grid" aria-label={t('calendar.title')}>
        {weekdays.map((wd) => (
          <div key={wd} className="daily-calendar-weekday" role="columnheader">
            {wd}
          </div>
        ))}

        {emptyCells.map((_, i) => (
          <div key={`empty-${i}`} className="daily-calendar-cell daily-calendar-cell--empty" />
        ))}

        {dayCells.map((day) => {
          const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayTodos = getTodosForDate(todos, dateStr);
          const isToday = dateStr === today;
          const isSelected = dateStr === selectedDate;

          let markerClass: string | null = null;
          if (dayTodos.length > 0) {
            const allDone = dayTodos.every((td) => td.isCompleted);
            markerClass = allDone
              ? 'daily-calendar-marker--complete'
              : 'daily-calendar-marker--incomplete';
          }

          const cellClasses = [
            'daily-calendar-cell',
            isToday ? 'daily-calendar-cell--today' : '',
            isSelected ? 'daily-calendar-cell--selected' : '',
          ]
            .filter(Boolean)
            .join(' ');

          const ariaLabel = dayTodos.length > 0
            ? `${dateStr} - ${dayTodos.every((td) => td.isCompleted) ? t('calendar.allCompleted') : t('calendar.hasIncomplete')}`
            : `${dateStr} - ${t('calendar.noTodos')}`;

          return (
            <div
              key={dateStr}
              className={cellClasses}
              role="gridcell"
              aria-label={ariaLabel}
              aria-selected={isSelected}
              onClick={() => handleDateClick(dateStr)}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleDateClick(dateStr);
                }
              }}
            >
              <span className="daily-calendar-day-number">{day}</span>
              {markerClass !== null ? (
                <span
                  className={`daily-calendar-marker ${markerClass}`}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
