
export class Exposure {
    constructor(
        public patientId: number,
        public timestamp: Date,
        public district: string,
        public address: string,
        public remarks: string,
    ) {

    }

    static fromMap(map: ExposureSchema) {
        // var dateParts = map.timestamp.split("/");

        // month is 0-based, that's why we need dataParts[1] - 1
        // var dateObject = new Date(+dateParts[2], parseInt(dateParts[1]) - 1, +dateParts[0]);
        return new Exposure(
            map.patient_id,
            new Date(map.timestamp),
            map.district,
            map.address,
            map.remarks
        );
    }

    public get timestampEnglish(): string {
        return `${this.timestamp.getDate()}/${this.timestamp.getMonth() + 1}/${this.timestamp.getFullYear()}`
    }

    public get fullDistrict(): string {
        return districtCodeToName(this.district);
    }

}

export interface ExposureSchema {
    patient_id: number;
    timestamp: string;
    district: string;
    address: string;
    remarks: string;
}

export const districtCodeToName = (code: string): string => {
    switch (code) {
        case "cw": return "Central and Western 中西區";
        case "ea": return "Eastern 東區";
        case "is": return "Islands 離島";
        case "kc": return "Kowloon City 九龍城";
        case "ki": return "Kwai Tsing 葵青";
        case "ku": return "Kwun Tong 觀塘";
        case "no": return "North 北區";
        case "sk": return "Sai Kung 西貢";
        case "st": return "Sha Tin 沙田";
        case "ss": return "Sham Shui Po 深水埗";
        case "so": return "Southern 南區";
        case "tp": return "Tai Po 大埔";
        case "tw": return "Tsuen Wan 荃灣";
        case "tm": return "Tuen Mun 屯門";
        case "wc": return "Wan Chai 灣仔";
        case "wt": return "Wong Tai Sin 黃大仙";
        case "yt": return "Yau Tsim Mong 油尖旺";
        case "yl": return "Yuen Long 元朗";
        default: return "其他";
    }
}
