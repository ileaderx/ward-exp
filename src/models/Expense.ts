import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

const ExpenseSchema = new Schema(
  {
    amount: { type: Number, required: true, min: 0.001 },
    category: { type: String, required: true, trim: true, maxlength: 40 },
    note: { type: String, trim: true, maxlength: 200, default: "" },
    date: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

export type ExpenseDoc = InferSchemaType<typeof ExpenseSchema> & { _id: mongoose.Types.ObjectId };

const Expense: Model<ExpenseDoc> =
  (mongoose.models.Expense as Model<ExpenseDoc>) || mongoose.model<ExpenseDoc>("Expense", ExpenseSchema);

export default Expense;
