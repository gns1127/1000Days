// src/components/DateInputWithCalendar.jsx

import React, { useState, useRef } from 'react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import './DateInputWithCalendar.css';
import { ko } from 'date-fns/locale'; // 한글 로케일 추가

function DateInputWithCalendar({ selected, onChange }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const ref = useRef();

  const handleDateSelect = (date) => {
    onChange(date);
    setShowCalendar(false); // 선택하면 닫기
  };

  const formatDate = (date) => {
    return date ? date.toLocaleDateString('ko-KR') : '';
  };

  return (
    <div className="date-input-wrapper" ref={ref}>
      <input
        type="text"
        readOnly
        placeholder="날짜를 선택하세요"
        onClick={() => setShowCalendar(!showCalendar)}
        value={formatDate(selected)}
        className="date-input"
      />

      {showCalendar && (
        <div className="calendar-popup">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleDateSelect}
            fromYear={1990}
            toYear={2030}
            defaultMonth={selected}
            captionLayout="dropdown" // ✅ 년도 선택 가능하게
            locale={ko} // ✅ 한글 로케일 적용

          />
        </div>
      )}
    </div>
  );
}

export default DateInputWithCalendar;
