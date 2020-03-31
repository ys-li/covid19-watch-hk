import { ExposureSchema, Exposure } from "./exposure";

export class Case {

    constructor(
        public age: number,
        public confirmTimestamp: Date,
        public history: string,
        public sex: string,
        public patientId: number,
        public exposures: Exposure[],
        public updatedAt: Date,
    ) { }

    static fromMap(map: CaseSchema): Case {
        // var dateParts = map.confirm_timestamp.split("/");

        // month is 0-based, that's why we need dataParts[1] - 1
        // var dateObject = new Date(+dateParts[2], parseInt(dateParts[1]) - 1, +dateParts[0]);
        return new Case(
            map.age,
            new Date(map.confirm_timestamp),
            map.history,
            map.sex,
            map.patient_id,
            map.exposures.map((exposure) => Exposure.fromMap(exposure)),
            new Date(map.updated_at),
        );
    }

    public get timestampEnglish() : string {
        return `${this.confirmTimestamp.getDate()}/${this.confirmTimestamp.getMonth()+1}/${this.confirmTimestamp.getFullYear()}`
    }

    public get updatedAtEnglish() : string {
        return `${this.updatedAt.getDate()}/${this.updatedAt.getMonth()+1}/${this.updatedAt.getFullYear()} ${this.updatedAt.toLocaleTimeString()}`
    }
    
    public exposuresByDistrict(district: string | undefined) : Exposure[] {
        if (district === undefined) return [];
        let exposures = this.exposures.filter((e) => e.district === district);
        return exposures;
    }
    
}

export interface CaseSchema {
    age: number;
    history: string;
    sex: string;
    confirm_timestamp: string;
    patient_id: number;
    exposures: ExposureSchema[];
    updated_at: string;
}