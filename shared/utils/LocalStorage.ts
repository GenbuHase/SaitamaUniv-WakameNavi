import { type Ref, ref } from "vue";

export default class LocalStorage {
  public data: Ref = ref(null);

  constructor(public storageId: string) {
    watch(this.data, (newValue: Ref) => {
      if (newValue.value !== this.data.value) this.save();
    }, { deep: true });

    this.init();
  }

  /**
   * Initializes the storage.
   */
  public init() {
    if (!this.exists()) this.set({});
    else this.load();
  }

  /**
   * @param key The key of the data
   * @param value The value of the data
   */
  public set(key: string, value: any): void;
  
  /**
   * @param value The value of the data
   */
  public set(value: any): void;

  /**
   * Sets the value to the data.
   */
  public set(arg1: any, arg2?: any): void {
    switch (arguments.length) {
      case 1:
        this.data.value = arg1;
        return;

      case 2:
        this.data.value[arg1] = arg2;
        return;
    }
  }

  public get(): any;

  /**
   * @param {string} key The key of the data
   */
  public get(key: string): any;

  /**
   * Gets the value of the data.
   * @returns {any} The value of the data
   */
  public get(arg1?: any): any {
    switch (arguments.length) {
      case 0:
        return this.data.value;

      case 1:
        return this.data.value[arg1];
    }
  }

  /**
   * Saves the data to the local storage.
   * @returns {boolean} Whether the data was saved successfully
   */
  public save(): boolean {
    let value;

    if (this.isJSONable()) {
      value = JSON.stringify(this.data.value);
    } else {
      value = this.data.value;
    }

    try {
      localStorage.setItem(this.storageId, value);
      return true;
    } catch (err) {
      return false;
    }
  }

  /**
   * Loads the data from the local storage.
   * @returns {object | Array<any> | null} The data loaded from the local storage
   */
  public load(): object | Array<any> | null {
    const rawData = localStorage.getItem(this.storageId);

    if (!rawData) return null;

    try {
      this.data.value = JSON.parse(rawData);
    } catch (err) {
      this.data.value = rawData;
    }

    return this.data.value;
  }

  /**
   * Returns whether the data exists in the local storage.
   * @returns {boolean} Whether the data exists in the local storage
   */
  public exists(): boolean {
    return !!localStorage.getItem(this.storageId);
  }

  /**
   * Returns whether the data could be converted to JSON format.
   * @returns {boolean} Whether the data could be converted to JSON format
   */
  public isJSONable(): boolean {
    if (this.data.value === undefined) return false;

    try {
      JSON.stringify(this.data.value);
      return true;
    } catch (err) {
      return false;
    }
  }
}