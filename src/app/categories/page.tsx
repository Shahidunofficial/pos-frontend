'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { apiService, Category } from '../../API'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  parentId: z.string().optional(),
  level: z.number().min(1).max(3),
})

type CategoryFormData = z.infer<typeof categorySchema>

interface CategoryWithSubs extends Category {
  subCategories: CategoryWithSubs[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithSubs[]>([])
  const [selectedParentId, setSelectedParentId] = useState<string>('')
  const [selectedLevel, setSelectedLevel] = useState<number>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      level: 1,
    },
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await apiService.getCategories()
      setCategories(response)
    } catch (error) {
      toast.error('Failed to fetch categories')
      console.error(error)
    }
  }

  const onSubmit = async (data: CategoryFormData) => {
    setIsSubmitting(true)
    try {
      await apiService.createCategory({
        name: data.name,
        parentId: data.parentId,
        level: data.level,
      })
      toast.success('Category created successfully')
      fetchCategories()
      reset()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create category')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCategoryTree = (category: CategoryWithSubs, depth = 0) => {
    return (
      <div key={category.id} className={`ml-${depth * 4}`}>
        <div className="flex items-center py-2">
          <span className="font-medium">{category.name}</span>
          <span className="ml-2 text-sm text-gray-500">(Level {category.level})</span>
        </div>
        {category.subCategories?.map((subCategory) =>
          renderCategoryTree(subCategory, depth + 1)
        )}
      </div>
    )
  }

  const getAvailableParentCategories = () => {
    const flattenCategories = (cats: CategoryWithSubs[], level: number): CategoryWithSubs[] => {
      return cats.reduce((acc, cat) => {
        if (cat.level === level) {
          return [...acc, cat, ...flattenCategories(cat.subCategories, level)]
        }
        return [...acc, ...flattenCategories(cat.subCategories, level)]
      }, [] as CategoryWithSubs[])
    }

    return selectedLevel === 1
      ? []
      : flattenCategories(categories, selectedLevel - 1)
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Categories</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your product categories and subcategories
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Category Form */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Add New Category</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Category Name
                </label>
                <input
                  type="text"
                  id="name"
                  {...register('name')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700">
                  Category Level
                </label>
                <select
                  id="level"
                  {...register('level', { valueAsNumber: true })}
                  onChange={(e) => setSelectedLevel(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value={1}>Main Category</option>
                  <option value={2}>Sub Category</option>
                  <option value={3}>Sub-Sub Category</option>
                </select>
                {errors.level && (
                  <p className="mt-2 text-sm text-red-600">{errors.level.message}</p>
                )}
              </div>

              {selectedLevel > 1 && (
                <div>
                  <label htmlFor="parentId" className="block text-sm font-medium text-gray-700">
                    Parent Category
                  </label>
                  <select
                    id="parentId"
                    {...register('parentId')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">Select a parent category</option>
                    {getAvailableParentCategories().map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.parentId && (
                    <p className="mt-2 text-sm text-red-600">{errors.parentId.message}</p>
                  )}
                </div>
              )}

              <div className="mt-5">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Category Tree */}
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Category Structure</h3>
            <div className="mt-5">
              {categories.map((category) => renderCategoryTree(category))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 