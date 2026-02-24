import BankConfig from '../models/BankConfig.js';

/**
 * GET /api/bank-config
 * Public – ai cũng xem được (frontend cần để tạo QR)
 */
export const getBankConfig = async (req, res) => {
    try {
        // Tìm config, nếu chưa có thì tạo document mặc định
        let config = await BankConfig.findOne();
        if (!config) {
            config = await BankConfig.create({
                bankCode: 'MB',
                accountNumber: '0336743580',
                accountName: 'TRAN LE HOANG THIEN',
                depositPercent: 30
            });
        }
        res.json(config);
    } catch (error) {
        console.error('❌ Error getting bank config:', error);
        res.status(500).json({ message: error.message });
    }
};

/**
 * PUT /api/bank-config
 * Admin only – chỉ admin được thay đổi thông tin QR ngân hàng
 */
export const updateBankConfig = async (req, res) => {
    try {
        const { bankCode, accountNumber, accountName, depositPercent } = req.body;

        // Validate depositPercent
        if (depositPercent !== undefined) {
            const pct = Number(depositPercent);
            if (isNaN(pct) || pct < 0 || pct > 100) {
                return res.status(400).json({ message: 'depositPercent phải từ 0 đến 100' });
            }
        }

        // Upsert – tạo nếu chưa có, cập nhật nếu đã có
        const config = await BankConfig.findOneAndUpdate(
            {},
            {
                ...(bankCode && { bankCode }),
                ...(accountNumber && { accountNumber }),
                ...(accountName && { accountName }),
                ...(depositPercent !== undefined && { depositPercent: Number(depositPercent) })
            },
            { new: true, upsert: true }
        );

        console.log('✅ Bank config updated by admin:', req.user.email);
        res.json({ message: 'Cập nhật thông tin ngân hàng thành công', config });
    } catch (error) {
        console.error('❌ Error updating bank config:', error);
        res.status(500).json({ message: error.message });
    }
};
