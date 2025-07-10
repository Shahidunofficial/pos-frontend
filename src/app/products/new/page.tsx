'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { apiService } from '../../../API'

const variantSchema = z.object({
  id: z.string(),
  color: z.string().optional(),
  ram: z.string().optional(),
  storage: z.string().optional(),
  purchasedPrice: z.number().min(0.01, 'Purchased price must be greater than 0'),
  sellingPrice: z.number().min(0.01, 'Selling price must be greater than 0'),
  stock: z.number().min(0, 'Stock cannot be negative'),
})

const productSchema = z.object({
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
  availableOptions: z.object({
    color: z.array(z.string()).optional(),
    ram: z.array(z.string()).optional(),
    storage: z.array(z.string()).optional(),
  }),
  variants: z.array(variantSchema),
})

type ProductFormData = z.infer<typeof productSchema>

interface Category {
  id: string;
  name: string;
  subCategories: Category[];
}

export default function NewProductPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedMainCategory, setSelectedMainCategory] = useState('')
  const [selectedSubCategory, setSelectedSubCategory] = useState('')
  const [specifications, setSpecifications] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [colorOptions, setColorOptions] = useState<string[]>([])
  const [ramOptions, setRamOptions] = useState<string[]>([])
  const [storageOptions, setStorageOptions] = useState<string[]>([])
  const [variants, setVariants] = useState<Array<{
    id: string;
    color?: string;
    ram?: string;
    storage?: string;
    purchasedPrice: number;
    sellingPrice: number;
    stock: number;
  }>>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      specifications: {},
      availableOptions: {
        color: [],
        ram: [],
        storage: [],
      },
      variants: [],
    },
  })

  // Fetch categories when component mounts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiService.getCategories()
        setCategories(response)
      } catch (error) {
        toast.error('Failed to fetch categories')
        console.error(error)
      }
    }
    fetchCategories()
  }, [])

  // Get available subcategories based on selected main category
  const getSubCategories = () => {
    const mainCategory = categories.find(cat => cat.id === selectedMainCategory)
    return mainCategory?.subCategories || []
  }

  // Get available sub-subcategories based on selected subcategory
  const getSubSubCategories = () => {
    const subCategories = getSubCategories()
    const subCategory = subCategories.find(cat => cat.id === selectedSubCategory)
    return subCategory?.subCategories || []
  }

  // Watch main category changes
  const mainCategory = watch('mainCategory')
  useEffect(() => {
    if (mainCategory !== selectedMainCategory) {
      setSelectedMainCategory(mainCategory)
      setSelectedSubCategory('')
      setValue('subCategory', '')
      setValue('subSubCategory', '')
    }
  }, [mainCategory, selectedMainCategory, setValue])

  // Watch sub category changes
  const subCategory = watch('subCategory')
  useEffect(() => {
    if (subCategory !== selectedSubCategory) {
      setSelectedSubCategory(subCategory || '')
      setValue('subSubCategory', '')
    }
  }, [subCategory, selectedSubCategory, setValue])

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

  const addColorOption = () => {
    const color = prompt('Enter new color variant:')
    if (color && !colorOptions.includes(color)) {
      const newColors = [...colorOptions, color]
      setColorOptions(newColors)
      setValue('availableOptions.color', newColors)
      generateVariants(newColors, ramOptions, storageOptions)
    }
  }

  const addRamOption = () => {
    const ram = prompt('Enter new RAM variant (e.g., "8GB"):')
    if (ram && !ramOptions.includes(ram)) {
      const newRamOptions = [...ramOptions, ram]
      setRamOptions(newRamOptions)
      setValue('availableOptions.ram', newRamOptions)
      generateVariants(colorOptions, newRamOptions, storageOptions)
    }
  }

  const addStorageOption = () => {
    const storage = prompt('Enter new storage variant (e.g., "256GB"):')
    if (storage && !storageOptions.includes(storage)) {
      const newStorageOptions = [...storageOptions, storage]
      setStorageOptions(newStorageOptions)
      setValue('availableOptions.storage', newStorageOptions)
      generateVariants(colorOptions, ramOptions, newStorageOptions)
    }
  }

  const generateVariants = (colors: string[], rams: string[], storages: string[]) => {
    const basePrice = watch('basePrice') || 0
    const purchasedPrice = watch('purchasedPrice') || 0
    const sellingPrice = watch('sellingPrice') || basePrice
    const newVariants: Array<{
      id: string;
      color?: string;
      ram?: string;
      storage?: string;
      purchasedPrice: number;
      sellingPrice: number;
      stock: number;
    }> = []

    // If no variants of any kind, create a default variant
    if (colors.length === 0 && rams.length === 0 && storages.length === 0) {
      newVariants.push({
        id: 'default',
        purchasedPrice: purchasedPrice,
        sellingPrice: sellingPrice,
        stock: 0,
      })
    } else {
      // Generate all possible combinations
      const addVariant = (color?: string, ram?: string, storage?: string) => {
        const id = [
          color && `color-${color}`,
          ram && `ram-${ram}`,
          storage && `storage-${storage}`,
        ].filter(Boolean).join('-') || 'default'

        newVariants.push({
          id,
          color,
          ram,
          storage,
          purchasedPrice: purchasedPrice,
          sellingPrice: sellingPrice,
          stock: 0,
        })
      }

      // Handle all combinations
      if (colors.length > 0) {
        colors.forEach(color => {
          if (rams.length > 0) {
            rams.forEach(ram => {
              if (storages.length > 0) {
                storages.forEach(storage => {
                  addVariant(color, ram, storage)
                })
              } else {
                addVariant(color, ram)
              }
            })
          } else if (storages.length > 0) {
            storages.forEach(storage => {
              addVariant(color, undefined, storage)
            })
          } else {
            addVariant(color)
          }
        })
      } else if (rams.length > 0) {
        rams.forEach(ram => {
          if (storages.length > 0) {
            storages.forEach(storage => {
              addVariant(undefined, ram, storage)
            })
          } else {
            addVariant(undefined, ram)
          }
        })
      } else if (storages.length > 0) {
        storages.forEach(storage => {
          addVariant(undefined, undefined, storage)
        })
      }
    }

    setVariants(newVariants)
    setValue('variants', newVariants)
  }

  const updateVariant = (variantId: string, field: 'purchasedPrice' | 'sellingPrice' | 'stock', value: number) => {
    const newVariants = variants.map(variant => {
      if (variant.id === variantId) {
        return { ...variant, [field]: value }
      }
      return variant
    })
    setVariants(newVariants)
    setValue('variants', newVariants)
  }

  const removeColorOption = (color: string) => {
    const newColors = colorOptions.filter(c => c !== color)
    setColorOptions(newColors)
    setValue('availableOptions.color', newColors)
    generateVariants(newColors, ramOptions, storageOptions)
  }

  const removeRamOption = (ram: string) => {
    const newRamOptions = ramOptions.filter(r => r !== ram)
    setRamOptions(newRamOptions)
    setValue('availableOptions.ram', newRamOptions)
    generateVariants(colorOptions, newRamOptions, storageOptions)
  }

  const removeStorageOption = (storage: string) => {
    const newStorageOptions = storageOptions.filter(s => s !== storage)
    setStorageOptions(newStorageOptions)
    setValue('availableOptions.storage', newStorageOptions)
    generateVariants(colorOptions, ramOptions, newStorageOptions)
  }

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true)
    try {
      const newProduct = await apiService.createProduct(data)
      toast.success('Product created successfully')
      router.push('/products')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create product')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-4 sm:px-6 lg:px-8">
      <div className="space-y-12">
        <div className="border-b border-gray-900/10 pb-12">
          <h2 className="text-base font-semibold leading-7 text-gray-900">Add New Product</h2>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Enter the product details below.
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

            <div className="sm:col-span-4">
              <label htmlFor="mainCategory" className="block text-sm font-medium leading-6 text-gray-900">
                Main Category
              </label>
              <div className="mt-2">
                <select
                  id="mainCategory"
                  {...register('mainCategory')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.mainCategory && (
                  <p className="mt-2 text-sm text-red-600">{errors.mainCategory.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="subCategory" className="block text-sm font-medium leading-6 text-gray-900">
                Sub Category
              </label>
              <div className="mt-2">
                <select
                  id="subCategory"
                  {...register('subCategory')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  disabled={!selectedMainCategory}
                >
                  <option value="">Select a sub-category</option>
                  {getSubCategories().map((subCategory) => (
                    <option key={subCategory.id} value={subCategory.id}>
                      {subCategory.name}
                    </option>
                  ))}
                </select>
                {errors.subCategory && (
                  <p className="mt-2 text-sm text-red-600">{errors.subCategory.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="subSubCategory" className="block text-sm font-medium leading-6 text-gray-900">
                Sub-Sub Category
              </label>
              <div className="mt-2">
                <select
                  id="subSubCategory"
                  {...register('subSubCategory')}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary-600 sm:text-sm sm:leading-6"
                  disabled={!selectedSubCategory}
                >
                  <option value="">Select a sub-sub-category</option>
                  {getSubSubCategories().map((subSubCategory) => (
                    <option key={subSubCategory.id} value={subSubCategory.id}>
                      {subSubCategory.name}
                    </option>
                  ))}
                </select>
                {errors.subSubCategory && (
                  <p className="mt-2 text-sm text-red-600">{errors.subSubCategory.message}</p>
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
                  onChange={(e) => {
                    setValue('basePrice', parseFloat(e.target.value))
                    generateVariants(colorOptions, ramOptions, storageOptions)
                  }}
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
                  onChange={(e) => {
                    setValue('purchasedPrice', parseFloat(e.target.value))
                    generateVariants(colorOptions, ramOptions, storageOptions)
                  }}
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
                  onChange={(e) => {
                    setValue('sellingPrice', parseFloat(e.target.value))
                    generateVariants(colorOptions, ramOptions, storageOptions)
                  }}
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

            <div className="sm:col-span-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium leading-6 text-gray-900">Product Variants (Optional)</h3>
                <p className="mt-1 text-sm text-gray-500">Add color, RAM, and storage variants for this product if applicable.</p>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Color Variants (Optional)</label>
                  <button
                    type="button"
                    onClick={addColorOption}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    + Add Color
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <div
                      key={color}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                    >
                      <span>{color}</span>
                      <button
                        type="button"
                        onClick={() => removeColorOption(color)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">RAM Variants (Optional)</label>
                  <button
                    type="button"
                    onClick={addRamOption}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    + Add RAM
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ramOptions.map((ram) => (
                    <div
                      key={ram}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                    >
                      <span>{ram}</span>
                      <button
                        type="button"
                        onClick={() => removeRamOption(ram)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">Storage Variants (Optional)</label>
                  <button
                    type="button"
                    onClick={addStorageOption}
                    className="text-sm text-primary-600 hover:text-primary-500"
                  >
                    + Add Storage
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {storageOptions.map((storage) => (
                    <div
                      key={storage}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                    >
                      <span>{storage}</span>
                      <button
                        type="button"
                        onClick={() => removeStorageOption(storage)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {variants.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Variant Combinations</h4>
                  <div className="grid gap-4">
                    {variants.map((variant) => (
                      <div
                        key={variant.id}
                        className="grid grid-cols-5 gap-4 items-center p-4 border rounded-lg"
                      >
                        <div className="col-span-2">
                          <p className="font-medium">
                            {[
                              variant.color,
                              variant.ram,
                              variant.storage
                            ].filter(Boolean).join(' - ') || 'Default Variant'}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500">Purchased Price (LKR)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.purchasedPrice}
                            onChange={(e) => updateVariant(variant.id, 'purchasedPrice', parseFloat(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter purchased price"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500">Selling Price (LKR)</label>
                          <input
                            type="number"
                            step="0.01"
                            value={variant.sellingPrice}
                            onChange={(e) => updateVariant(variant.id, 'sellingPrice', parseFloat(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter selling price"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-500">Stock</label>
                          <input
                            type="number"
                            value={variant.stock}
                            onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
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
          {isSubmitting ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  )
} 