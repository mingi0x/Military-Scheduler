import { useState } from 'react';
import { LargeCalendar } from './components/LargeCalendar';
import { DailyManagementView } from './components/DailyManagementView';
import { MonthlyManagementView } from './components/MonthlyManagementView';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDailyView, setShowDailyView] = useState(false);
  const [showMonthlyView, setShowMonthlyView] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  const [calendarDate, setCalendarDate] = useState(new Date());

  const sendDateToPython = async (year: number, month: number, day?: number) => {
    try {
      const response = await fetch('https://humble-system-v6ww966q6jr92x9ww-8000.app.github.dev/api/calendar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year,
          month,
          day: day || 0, // 일 정보가 없으면 0으로 설정
          type: day ? 'daily' : 'monthly' // 클릭 종류 구분용
        }),
      });
      const data = await response.json();
      console.log("서버 응답:", data);
    } catch (error) {
      console.error("데이터 전송 실패:", error);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setCalendarDate(new Date(date.getFullYear(), date.getMonth(), 1));
    setShowDailyView(true);
    setShowMonthlyView(false);
    sendDateToPython(date.getFullYear(), date.getMonth() + 1, date.getDate());
  };

  const handleMonthClick = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    setShowMonthlyView(true);
    setShowDailyView(false);
    sendDateToPython(year, month);
  };

  const handleBackFromDaily = () => {
    setShowDailyView(false);
  };

  const handleBackFromMonthly = () => {
    setShowMonthlyView(false);
  };

  if (showDailyView && selectedDate) {
    return <DailyManagementView selectedDate={selectedDate} onBack={handleBackFromDaily} />;
  }

  if (showMonthlyView) {
    return <MonthlyManagementView year={selectedYear} month={selectedMonth} onBack={handleBackFromMonthly} />;
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="w-[95vw] h-[92vh]">
        {/* 수정: calendarDate와 setCalendarDate를 Props로 전달 */}
        <LargeCalendar 
          currentDate={calendarDate} 
          setCurrentDate={setCalendarDate}
          onDateClick={handleDateClick} 
          onMonthClick={handleMonthClick} 
        />
      </div>
    </div>
  );
}