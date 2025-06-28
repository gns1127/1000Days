import { useState  } from "react";

import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

export default function DatePicker( selected, setSelected ) {

  return (
    <div className="date-picker-wrapper">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={setSelected}
        toDate={new Date()}
      />
    </div>
  );
}