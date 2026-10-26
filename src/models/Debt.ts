import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

// "owed_to_me": the person owes me (I lent). "i_owe": I owe the person (I borrowed).
export const DEBT_DIRECTIONS = ["owed_to_me", "i_owe"] as const;
export type DebtDirection = (typeof DEBT_DIRECTIONS)[number];

const PaymentSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0.001 },
    date: { type: Date, required: true },
    note: { type: String, trim: true, maxlength: 200, default: "" },
  },
  { _id: true },
);

const DebtSchema = new Schema(
  {
    person: { type: String, required: true, trim: true, maxlength: 60 },
    // See personKey() in lib/people.ts
    personKey: { type: String, required: true, index: true },
    direction: { type: String, enum: DEBT_DIRECTIONS, required: true },
    amount: { type: Number, required: true, min: 0.001 },
    paid: { type: Number, required: true, default: 0, min: 0 },
    payments: { type: [PaymentSchema], default: [] },
    note: { type: String, trim: true, maxlength: 200, default: "" },
    date: { type: Date, required: true },
    dueDate: { type: Date, default: null },
    settled: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

export type DebtDoc = InferSchemaType<typeof DebtSchema> & { _id: mongoose.Types.ObjectId };

const Debt: Model<DebtDoc> = (mongoose.models.Debt as Model<DebtDoc>) || mongoose.model<DebtDoc>("Debt", DebtSchema);

export default Debt;
