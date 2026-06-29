<template>
  <div>
    <div class="table-toolbar">
      <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
        <div class="search-box">
          <span>🔍</span>
          <input v-model="store.searchQuery" placeholder="搜索姓名、专业、电话..." />
        </div>
        <select v-model="store.gradeFilter" style="padding: 7px 12px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 13px; font-family: inherit; outline: none;">
          <option value="">全部年级</option>
          <option v-for="g in store.GRADES" :key="g" :value="g">{{ g }}</option>
        </select>
        <select v-model="store.genderFilter" style="padding: 7px 12px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 13px; font-family: inherit; outline: none;">
          <option value="">全部性别</option>
          <option v-for="g in store.GENDERS" :key="g" :value="g">{{ g }}</option>
        </select>
      </div>
      <button class="btn btn-primary" @click="openAddModal">
        + 添加学生
      </button>
    </div>

    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th @click="toggleSort('name')" style="cursor: pointer;">
              姓名 {{ sortIcon('name') }}
            </th>
            <th>性别</th>
            <th>年龄</th>
            <th>年级</th>
            <th>专业</th>
            <th @click="toggleSort('score')" style="cursor: pointer;">
              成绩 {{ sortIcon('score') }}
            </th>
            <th>评级</th>
            <th>手机号</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="store.filteredStudents.length === 0">
            <td colspan="9">
              <div class="empty-state">
                <div class="empty-icon">📭</div>
                <p>{{ store.students.length === 0 ? '暂无学生数据，点击"添加学生"开始' : '没有匹配的结果' }}</p>
              </div>
            </td>
          </tr>
          <tr v-for="student in store.filteredStudents" :key="student.id">
            <td style="font-weight: 500;">{{ student.name }}</td>
            <td>{{ student.gender }}</td>
            <td>{{ student.age }}</td>
            <td>{{ student.grade }}</td>
            <td>{{ student.major }}</td>
            <td style="font-weight: 600;">{{ student.score }}</td>
            <td>
              <span class="grade-tag" :class="store.gradeLevel(student.score).cls">
                {{ store.gradeLevel(student.score).text }}
              </span>
            </td>
            <td>{{ student.phone }}</td>
            <td>
              <div class="action-btns">
                <button class="btn btn-outline btn-xs" @click="openEditModal(student)">✏️</button>
                <button class="btn btn-danger btn-xs" @click="confirmDelete(student)">🗑</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal">
        <h3>{{ isEditing ? '编辑学生' : '添加学生' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>姓名 *</label>
            <input v-model="form.name" required placeholder="请输入姓名" />
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label>性别 *</label>
              <select v-model="form.gender" required>
                <option value="">请选择</option>
                <option v-for="g in store.GENDERS" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>年龄 *</label>
              <input v-model.number="form.age" type="number" min="15" max="30" required placeholder="18" />
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div class="form-group">
              <label>年级 *</label>
              <select v-model="form.grade" required>
                <option value="">请选择</option>
                <option v-for="g in store.GRADES" :key="g" :value="g">{{ g }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>成绩 *</label>
              <input v-model.number="form.score" type="number" min="0" max="100" required placeholder="85" />
            </div>
          </div>
          <div class="form-group">
            <label>专业 *</label>
            <select v-model="form.major" required>
              <option value="">请选择</option>
              <option v-for="m in store.MAJORS" :key="m" :value="m">{{ m }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>手机号</label>
            <input v-model="form.phone" placeholder="请输入手机号" />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-outline" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary">
              {{ isEditing ? '保存修改' : '添加' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Confirm Delete -->
    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
      <div class="modal" style="width: 380px;">
        <div class="confirm-dialog">
          <div style="font-size: 48px; margin-bottom: 8px;">⚠️</div>
          <h3 style="margin-bottom: 8px;">确认删除</h3>
          <p>确定要删除学生 <strong>{{ deleteTarget?.name }}</strong> 吗？此操作不可撤销。</p>
          <div class="modal-actions" style="justify-content: center;">
            <button class="btn btn-outline" @click="showDeleteConfirm = false">取消</button>
            <button class="btn btn-danger" @click="handleDelete">确认删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useStudentStore } from '../stores/student'

const store = useStudentStore()

const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref(null)
const showDeleteConfirm = ref(false)
const deleteTarget = ref(null)

function emptyForm() {
  return {
    name: '',
    gender: '',
    age: '',
    grade: '',
    score: '',
    major: '',
    phone: ''
  }
}

const form = reactive(emptyForm())

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  Object.assign(form, emptyForm())
  showModal.value = true
}

function openEditModal(student) {
  isEditing.value = true
  editingId.value = student.id
  Object.assign(form, {
    name: student.name,
    gender: student.gender,
    age: student.age,
    grade: student.grade,
    score: student.score,
    major: student.major,
    phone: student.phone
  })
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

function handleSubmit() {
  const data = { ...form }
  if (isEditing.value) {
    store.updateStudent(editingId.value, data)
  } else {
    store.addStudent(data)
  }
  closeModal()
}

function confirmDelete(student) {
  deleteTarget.value = student
  showDeleteConfirm.value = true
}

function handleDelete() {
  if (deleteTarget.value) {
    store.deleteStudent(deleteTarget.value.id)
  }
  showDeleteConfirm.value = false
  deleteTarget.value = null
}

function toggleSort(field) {
  if (store.sortField === field) {
    store.sortDir = store.sortDir === 'asc' ? 'desc' : 'asc'
  } else {
    store.sortField = field
    store.sortDir = 'asc'
  }
}

function sortIcon(field) {
  if (store.sortField !== field) return '⇅'
  return store.sortDir === 'asc' ? '↑' : '↓'
}
</script>
