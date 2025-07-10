'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import toast from 'react-hot-toast'
import { apiService, Category } from '../../../API'
import { FiChevronRight, FiChevronDown, FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  level: z.number().min(1).max(3),
  parentId: z.string().optional(),
})

type CategoryFormData = z.infer<typeof categorySchema>

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedLevel, setSelectedLevel] = useState(1)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
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
      console.log('Creating category with data:', data)
      await apiService.createCategory({
        name: data.name,
        level: data.level,
        parentId: data.parentId,
      })
      toast.success('Category created successfully')
      fetchCategories()
      reset()
      setSelectedLevel(1) // Reset to default level
    } catch (error) {
      console.error('Error creating category:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) {
        next.delete(categoryId)
      } else {
        next.add(categoryId)
      }
      return next
    })
  }

  const getAvailableParentCategories = (level: number) => {
    if (level === 1) return []
    
    const flatten = (cats: Category[] = [], targetLevel: number): Category[] => {
      if (!cats || !Array.isArray(cats)) return []
      
      return cats.reduce((acc, cat) => {
        if (!cat) return acc
        if (cat.level === targetLevel) {
          acc.push(cat)
        }
        if (cat.subCategories && Array.isArray(cat.subCategories)) {
          acc.push(...flatten(cat.subCategories, targetLevel))
        }
        return acc
      }, [] as Category[])
    }

    return flatten(categories || [], level - 1)
  }

  const renderCategory = (category: Category, depth = 0) => {
    if (!category || !category.id) return null
    
    const isExpanded = expandedCategories.has(category.id)
    const hasChildren = category.subCategories && Array.isArray(category.subCategories) && category.subCategories.length > 0

    return (
      <div key={category.id} className="select-none">
        <div 
          className={`flex items-center py-2 px-2 hover:bg-gray-50 rounded-md cursor-pointer`}
          style={{ marginLeft: `${depth * 16}px` }}
          onClick={() => hasChildren && toggleCategory(category.id)}
        >
          <div className="w-4 h-4 flex items-center justify-center mr-2">
            {hasChildren && (
              <span className="text-gray-600">{isExpanded ? '▼' : '▶'}</span>
            )}
          </div>
          <span className="flex-1 font-medium">{category.name}</span>
          <span className="text-sm text-gray-500 mr-4">Level {category.level}</span>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {category.subCategories.map((subCategory) => renderCategory(subCategory, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Create New Category</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Name
              </label>
              <input
                type="text"
                {...register('name')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Enter category name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category Level
              </label>
              <select
                {...register('level', { 
                  valueAsNumber: true,
                  onChange: (e) => {
                    setSelectedLevel(Number(e.target.value))
                    if (Number(e.target.value) === 1) {
                      setValue('parentId', undefined)
                    }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={1}>Main Category</option>
                <option value={2}>Sub Category</option>
                <option value={3}>Sub-Sub Category</option>
              </select>
              {errors.level && (
                <p className="mt-1 text-sm text-red-600">{errors.level.message}</p>
              )}
            </div>

            {selectedLevel > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Category
                </label>
                <select
                  {...register('parentId')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select parent category</option>
                  {getAvailableParentCategories(selectedLevel).map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.parentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.parentId.message}</p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Category'}
            </button>
          </form>
        </div>

        {/* Category Tree */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Category Structure</h2>
          <div className="space-y-2">
            {categories.map((category) => renderCategory(category))}
          </div>
        </div>
      </div>
    </div>
  )
} 