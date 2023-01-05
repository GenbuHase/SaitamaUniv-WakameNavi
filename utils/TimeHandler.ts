export default class TimeHandler {
  static getDifferenceInMinutes (date1: Date, date2: Date) {
    return Math.floor((date1.getTime() - date2.getTime()) / 1000 / 60);
  }
  
  static addHours (date: Date, hours: number) {
    date.setHours(date.getHours() + hours);
    return date;
  }

  static addMinutes (date: Date, minutes: number) {
    date.setMinutes(date.getMinutes() + minutes);
    return date;
  }

  static addSeconds (date: Date, seconds: number) {
    date.setSeconds(date.getSeconds() + seconds);
    return date;
  }

  /**
   * @param timeStr "HH:mm" format
   * @returns {Date}
   */
  static parseTimeStringToDate (timeStr: string) {
    const now: Date = new Date(Date.now());
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(timeStr.split(":")[0]), parseInt(timeStr.split(":")[1]));
  }

  /**
   * @param date
   * @returns {string}
   */
  static parseDateToTimeString (date: Date) {
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  }
}