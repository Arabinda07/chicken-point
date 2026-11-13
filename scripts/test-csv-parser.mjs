import { parsePhonePeCsv } from '../src/lib/phonepeCsvParser.ts';

const samplePhonePeCsv = `Date,Transaction ID,Bank Reference No,Payment Instrument,Amount,Status,Payer VPA,Payer Name
05-09-2026 10:30:15,T260905103045,424519284102,UPI,330.00,SUCCESS,sourav.m@oksbi,Sourav Mondal
05-09-2026 09:15:33,T260905091533,424519881023,UPI,1470.00,SUCCESS,subrata.rolls@oksbi,Subrata Da
05-09-2026 11:15:30,T260905111530,424319586721,UPI,420.00,SUCCESS,anita.dey@ybl,Anita Dey
05-09-2026 08:00:10,T260905080010,424319586999,UPI,150.00,FAILED,test@upi,Failed Customer
`;

// Simple verification
console.log('Sample CSV prepared.');
