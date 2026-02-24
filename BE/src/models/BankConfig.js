import mongoose from 'mongoose';

/**
 * BankConfig – Singleton model (chỉ có 1 document trong DB)
 * Admin/Owner cấu hình thông tin ngân hàng nhận tiền.
 */
const bankConfigSchema = new mongoose.Schema({
    bankCode: {
        type: String,
        default: 'MB'           // MB Bank
    },
    accountNumber: {
        type: String,
        required: true,
        default: '0336743580'
    },
    accountName: {
        type: String,
        required: true,
        default: 'TRAN LE HOANG THIEN'
    },
    depositPercent: {
        type: Number,
        min: 0,
        max: 100,
        default: 30             // 30% tiền cọc
    }
}, {
    timestamps: true
});

const BankConfig = mongoose.model('BankConfig', bankConfigSchema);

export default BankConfig;
