import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

const STORAGE_KEY = 'sms-students'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const MAJORS = ['计算机科学与技术', '软件工程', '数据科学', '人工智能', '网络工程', '信息安全', '电子信息工程', '数学与应用数学']

const GENDERS = ['男', '女']

const GRADES = ['2024级', '2023级', '2022级', '2021级']

export const useStudentStore = defineStore('student', () => {
  const students = ref(loadFromStorage())
  const searchQuery = ref('')
  const gradeFilter = ref('')
  const genderFilter = ref('')
  const sortField = ref('id')
  const sortDir = ref('desc')

  // Persist
  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students.value))
  }

  // CRUD
  function addStudent(data) {
    const student = {
      id: generateId(),
      ...data,
      score: Number(data.score),
      age: Number(data.age),
      createdAt: new Date().toISOString()
    }
    students.value.push(student)
    persist()
    return student
  }

  function updateStudent(id, data) {
    const idx = students.value.findIndex(s => s.id === id)
    if (idx === -1) return null
    students.value[idx] = {
      ...students.value[idx],
      ...data,
      score: Number(data.score),
      age: Number(data.age)
    }
    persist()
    return students.value[idx]
  }

  function deleteStudent(id) {
    const idx = students.value.findIndex(s => s.id === id)
    if (idx === -1) return false
    students.value.splice(idx, 1)
    persist()
    return true
  }

  function getStudentById(id) {
    return students.value.find(s => s.id === id) || null
  }

  // Filtered & sorted list
  const filteredStudents = computed(() => {
    let list = [...students.value]

    const q = searchQuery.value.trim().toLowerCase()
    if (q) {
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.major.toLowerCase().includes(q) ||
        s.phone.includes(q)
      )
    }

    if (gradeFilter.value) {
      list = list.filter(s => s.grade === gradeFilter.value)
    }

    if (genderFilter.value) {
      list = list.filter(s => s.gender === genderFilter.value)
    }

    list.sort((a, b) => {
      const field = sortField.value
      let va = a[field]
      let vb = b[field]
      if (field === 'score' || field === 'age') {
        va = Number(va)
        vb = Number(vb)
      }
      if (va < vb) return sortDir.value === 'asc' ? -1 : 1
      if (va > vb) return sortDir.value === 'asc' ? 1 : -1
      return 0
    })

    return list
  })

  // Stats
  const totalStudents = computed(() => students.value.length)

  const avgScore = computed(() => {
    if (students.value.length === 0) return 0
    const sum = students.value.reduce((acc, s) => acc + s.score, 0)
    return (sum / students.value.length).toFixed(2)
  })

  const maxScore = computed(() => {
    if (students.value.length === 0) return 0
    return Math.max(...students.value.map(s => s.score))
  })

  const minScore = computed(() => {
    if (students.value.length === 0) return 0
    return Math.min(...students.value.map(s => s.score))
  })

  const genderDistribution = computed(() => {
    const map = {}
    students.value.forEach(s => {
      map[s.gender] = (map[s.gender] || 0) + 1
    })
    return GENDERS.map(g => ({ name: g, value: map[g] || 0 }))
  })

  const gradeDistribution = computed(() => {
    const map = {}
    students.value.forEach(s => {
      map[s.grade] = (map[s.grade] || 0) + 1
    })
    return GRADES.map(g => ({ name: g, value: map[g] || 0 }))
  })

  const scoreDistribution = computed(() => {
    const ranges = [
      { label: '90-100', min: 90, max: 100 },
      { label: '80-89', min: 80, max: 89 },
      { label: '70-79', min: 70, max: 79 },
      { label: '60-69', min: 60, max: 69 },
      { label: '0-59', min: 0, max: 59 }
    ]
    return ranges.map(r => ({
      name: r.label,
      value: students.value.filter(s => s.score >= r.min && s.score <= r.max).length
    }))
  })

  const majorDistribution = computed(() => {
    const map = {}
    students.value.forEach(s => {
      map[s.major] = (map[s.major] || 0) + 1
    })
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  })

  const gradeLevel = (score) => {
    if (score >= 90) return { text: '优秀', cls: 'grade-excellent' }
    if (score >= 80) return { text: '良好', cls: 'grade-good' }
    if (score >= 70) return { text: '中等', cls: 'grade-average' }
    if (score >= 60) return { text: '及格', cls: 'grade-poor' }
    return { text: '不及格', cls: 'grade-poor' }
  }

  return {
    students,
    searchQuery,
    gradeFilter,
    genderFilter,
    sortField,
    sortDir,
    filteredStudents,
    totalStudents,
    avgScore,
    maxScore,
    minScore,
    genderDistribution,
    gradeDistribution,
    scoreDistribution,
    majorDistribution,
    gradeLevel,
    addStudent,
    updateStudent,
    deleteStudent,
    getStudentById,
    MAJORS,
    GENDERS,
    GRADES,
    persist
  }
})
