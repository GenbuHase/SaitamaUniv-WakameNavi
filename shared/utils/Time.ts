const Time = {
  getDifferenceInMinutes(date1: Date, date2: Date) {
    return Math.floor((date1.getTime() - date2.getTime()) / 1000 / 60);
  },

  addHours(date: Date, hours: number) {
    date.setHours(date.getHours() + hours);
    return date;
  },

  addMinutes(date: Date, minutes: number) {
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  },

  addSeconds(date: Date, seconds: number) {
    date.setSeconds(date.getSeconds() + seconds);
    return date;
  },

  /**
   * @param timeStr "HH:mm" format
   * @returns {Date}
   */
  parseTimeStringToDate(timeStr: string) {
    const now: Date = new Date(Date.now());
    const parts = timeStr.split(":");
    const hours = parseInt(parts[0] ?? "0", 10);
    const minutes = parseInt(parts[1] ?? "0", 10);
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
  },

  /**
   * @param date
   * @returns {string}
   */
  parseDateToTimeString(date: Date) {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  },
};

export default Time;
