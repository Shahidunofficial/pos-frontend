import { FieldErrors, UseFormRegister } from 'react-hook-form'

export interface SaleFormData {
  customerName: string
  customerEmail?: string
  customerPhone?: string
}

interface Props {
  register: UseFormRegister<SaleFormData>
  errors: FieldErrors<SaleFormData>
}

export default function CustomerInfoForm({ register, errors }: Props) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold text-secondary-900 mb-4">Customer Information</h2>
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label htmlFor="customerName" className="block text-sm font-medium text-secondary-700">
            Name
          </label>
          <input
            id="customerName"
            {...register('customerName')}
            className="input-field mt-1.5"
            placeholder="Enter customer name"
          />
          {errors.customerName && <p className="mt-1.5 text-sm text-red-600">{errors.customerName.message}</p>}
        </div>

        <div>
          <label htmlFor="customerEmail" className="block text-sm font-medium text-secondary-700">
            Email (Optional)
          </label>
          <input
            id="customerEmail"
            type="email"
            {...register('customerEmail')}
            className="input-field mt-1.5"
            placeholder="Enter customer email"
          />
          {errors.customerEmail && <p className="mt-1.5 text-sm text-red-600">{errors.customerEmail.message}</p>}
        </div>

        <div>
          <label htmlFor="customerPhone" className="block text-sm font-medium text-secondary-700">
            Phone (Optional)
          </label>
          <input
            id="customerPhone"
            type="tel"
            {...register('customerPhone')}
            className="input-field mt-1.5"
            placeholder="Enter customer phone"
          />
        </div>
      </div>
    </div>
  )
}
