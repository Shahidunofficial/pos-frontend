'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { productsApi, Product, UpdateProductRequest } from '../../../../API'

const editProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  brand: z.string().min(1, 'Brand is required'),
  mainCategory: z.string().min(1, 'Main category is required'),
  subCategory: z.string().optional(),
  subSubCategory: z.string().optional(),
  basePrice: z.number().min(0.01, 'Base price must be greater than 0'),
  purchasedPrice: z.number().min(0.01, 'Purchased price must be greater than 0'),
  sellingPrice: z.number().min(0.01, 'Selling price must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  images: z.array(z.string()).min(1, 'At least one image is required').max(3, 'Maximum 3 images allowed'),
  specifications: z.record(z.string(), z.string()).optional(),
})

type EditProductFormData = z.infer<typeof editProductSchema>

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.id as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<EditProductFormData>({
    resolver: zodResolver(editProductSchema),
  })

  // Fetch product data when component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true)
        const productData = await productsApi.getById(productId)
        setProduct(productData)
        
        // Populate form with existing data
        setValue('name', productData.name)
        setValue('brand', productData.brand)
        setValue('mainCategory', productData.mainCategory)
        setValue('subCategory', productData.subCategory || '')
        setValue('subSubCategory', productData.subSubCategory || '')
        setValue('basePrice', productData.basePrice)
        setValue('purchasedPrice', productData.purchasedPrice)
        setValue('sellingPrice', productData.sellingPrice)
        setValue('description', productData.description)
        setValue('images', productData.images)
        setValue('specifications', productData.specifications || {})
        
        // Set state variables
        setImageUrls(productData.images)
        
        // Convert specifications object to array
        const specsArray = Object.entries(productData.specifications || {}).map(([key, value]) => ({
          key,
          value,
        }))
        setSpecifications(specsArray.length > 0 ? specsArray : [{ key: '', value: '' }])
        
      } catch (error) {
        toast.error('Failed to fetch product data')
        console.error(error)
        router.push('/products')
      } finally {
        setIsLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId, setValue, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    if (imageUrls.length + files.length > 3) {
      toast.error('Maximum 3 images allowed')
      return
    }

    // Here you would typically upload the files to your storage service
    // For now, we'll just create local URLs
    const newUrls = Array.from(files).map(file => URL.createObjectURL(file))
    const updatedUrls = [...imageUrls, ...newUrls]
    setImageUrls(updatedUrls)
    setValue('images', updatedUrls)
  }

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }])
  }

  const removeSpecification = (index: number) => {
    const newSpecs = specifications.filter((_, i) => i !== index)
    setSpecifications(newSpecs)
  }

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const newSpecs = [...specifications]
    newSpecs[index][field] = value
    setSpecifications(newSpecs)

    // Update the specifications object in the form data
    const specsObject = newSpecs.reduce((acc, spec) => {
      if (spec.key && spec.value) {
        acc[spec.key] = spec.value
      }
      return acc
    }, {} as Record<string, string>)
    setValue('specifications', specsObject)
  }

  const onSubmit = async (data: EditProductFormData) => {
    setIsSubmitting(true)
    try {
      const updateData: UpdateProductRequest = {
        name: data.name,
        brand: data.brand,
        mainCategory: data.mainCategory,
        subCategory: data.subCategory || undefined,
        subSubCategory: data.subSubCategory || undefined,
        basePrice: data.basePrice,
        purchasedPrice: data.purchasedPrice,
        sellingPrice: data.sellingPrice,
        description: data.description,
        images: data.images,
        specifications: data.specifications || {},
      }

      // Only include variants and availableOptions if they exist in the current product
      if (product && product.variants && product.variants.length > 0) {
        updateData.variants = product.variants;
      }
      if (product && product.availableOptions) {
        updateData.availableOptions = product.availableOptions;
      }

      console.log('Updating product with data:', updateData);
      const updatedProduct = await productsApi.update(productId, updateData)
      console.log('Product updated:', updatedProduct);
      
      toast.success('Product updated successfully')
      router.push('/products')
    } catch (error) {
      console.error('Error updating product:', error)
      if (error instanceof Error) {
        toast.error(`Failed to update product: ${error.message}`)
      } else {
        toast.error('Failed to update product: Unknown error occurred')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Example of using different API methods
  const handlePricingUpdate = async () => {
    try {
      const basePrice = watch('basePrice')
      const purchasedPrice = watch('purchasedPrice')
      const sellingPrice = watch('sellingPrice')
      
      await productsApi.update(productId, {
        basePrice,
        purchasedPrice,
        sellingPrice,
      })
      toast.success('Pricing updated successfully')
    } catch (error) {
      toast.error('Failed to update pricing')
      console.error(error)
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading product...</div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 animate-fade-in">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Product not found</div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-4 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Edit Product</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Update the product details below.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Product Name
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="brand" className="block text-sm font-medium leading-6 text-gray-900">
                Brand
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  id="brand"
                  {...register('brand')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
                {errors.brand && (
                  <p className="mt-2 text-sm text-red-600">{errors.brand.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="basePrice" className="block text-sm font-medium leading-6 text-gray-900">
                Base Price (LKR)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  id="basePrice"
                  step="0.01"
                  {...register('basePrice', { valueAsNumber: true })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="Enter base price in LKR"
                />
                {errors.basePrice && (
                  <p className="mt-2 text-sm text-red-600">{errors.basePrice.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="purchasedPrice" className="block text-sm font-medium leading-6 text-gray-900">
                Purchased Price (LKR)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  id="purchasedPrice"
                  step="0.01"
                  {...register('purchasedPrice', { valueAsNumber: true })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="Enter purchased price in LKR"
                />
                {errors.purchasedPrice && (
                  <p className="mt-2 text-sm text-red-600">{errors.purchasedPrice.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="sellingPrice" className="block text-sm font-medium leading-6 text-gray-900">
                Selling Price (LKR)
              </label>
              <div className="mt-2">
                <input
                  type="number"
                  id="sellingPrice"
                  step="0.01"
                  {...register('sellingPrice', { valueAsNumber: true })}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  placeholder="Enter selling price in LKR"
                />
                {errors.sellingPrice && (
                  <p className="mt-2 text-sm text-red-600">{errors.sellingPrice.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-gray-900">
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                />
                {errors.description && (
                  <p className="mt-2 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Product Images (Max 3)
              </label>
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-600 hover:file:bg-primary-100"
                />
                {errors.images && (
                  <p className="mt-2 text-sm text-red-600">{errors.images.message}</p>
                )}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {imageUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img src={url} alt={`Product ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() => {
                          const newUrls = imageUrls.filter((_, i) => i !== index)
                          setImageUrls(newUrls)
                          setValue('images', newUrls)
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 m-1"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium leading-6 text-gray-900">
                Specifications
              </label>
              <div className="mt-2 space-y-4">
                {specifications.map((spec, index) => (
                  <div key={index} className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Specification name"
                      value={spec.key}
                      onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                      className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                    <input
                      type="text"
                      placeholder="Specification value"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      className="block w-1/2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSpecification}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-500"
                >
                  + Add Specification
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-x-6">
        <div className="flex gap-x-3">
          <button
            type="button"
            onClick={handlePricingUpdate}
            className="rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500"
          >
            Update Pricing Only
          </button>
        </div>
        <div className="flex gap-x-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm font-semibold leading-6 text-gray-900"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            {isSubmitting ? 'Updating...' : 'Update Product'}
          </button>
        </div>
      </div>
    </form>
  )
} 