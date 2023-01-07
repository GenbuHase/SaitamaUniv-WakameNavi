import Bus from "./";

const { KokusaiKogyo, Seibu } = Bus;

export class BusStop {
  public id: string;
  public code: string;
  public name: string;
  
  constructor (option: { id: string, code: string, name: string }) {
    this.id = option.id,
    this.code = option.code,
    this.name = option.name;
  }

  public doesExistsInKokusaiKogyo (): boolean {
    return this.id in KokusaiKogyo.BUS_STOPS;
  }

  public doesExistsInSeibu (): boolean {
    return this.id in Seibu.BUS_STOPS;
  }
}

export default BusStop;