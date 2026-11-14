const $ = selector => document.querySelector(selector)
const osNames = { windows: 'Windows', macos: 'macOS', linux: 'Linux (Ubuntu)' }
const storageKey = 'marist-launchpad-v1'
let saved = {}
try { saved = JSON.parse(localStorage.getItem(storageKey) || '{}') || {} } catch {}
let os = Object.hasOwn(osNames, saved.os) ? saved.os : 'windows'
let completed = Array.isArray(saved.completed) ? saved.completed.filter(item => typeof item === 'string') : []
let filter = 'all'
let query = ''
let toastTimer
let activeGuide

function notify(message) {
  $('#toast').textContent = message
  $('#toast').style.display = 'block'
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { $('#toast').style.display = 'none' }, 3500)
}

function persist() {
  try { localStorage.setItem(storageKey, JSON.stringify({ os, completed })) }
  catch { notify('Browser storage is unavailable. Progress will last for this visit.') }
}

const isDone = id => completed.includes(`${os}:${id}`)
const countDone = course => course.tools.filter(isDone).length
const osPicker = () => `<label class="os-picker">I’m using <select class="detail-os" aria-label="Operating system">${Object.entries(osNames).map(([key, label]) => `<option value="${key}" ${os === key ? 'selected' : ''}>${label}</option>`).join('')}</select></label>`
const tags = ids => ids.map(id => `<span class="tag">${tools[id].tag}</span>`).join('')

function courseCard(course) {
  const done = countDone(course)
  return `<article class="course-card"><div class="card-top"><span class="course-icon ${course.category}" aria-hidden="true">${course.icon}</span><span class="level">${course.level}</span></div><div class="card-body"><span class="course-code">${course.code}</span><h3>${course.name}</h3><p>${course.description}</p><div class="tags">${tags(course.tools)}</div></div><div class="card-footer"><span>${done ? `${done}/${course.tools.length} complete` : `${course.tools.length} tools · ${course.time}`}</span><a href="#course/${course.id}" aria-label="View ${course.name} guide">View guide <span aria-hidden="true">↗</span></a></div></article>`
}

function renderCatalog() {
  const matches = courses.filter(course => (filter === 'all' || course.category === filter) && `${course.name} ${course.code} ${course.tools.map(id => `${tools[id].name} ${tools[id].tag}`).join(' ')}`.toLowerCase().includes(query))
  $('#course-grid').innerHTML = matches.length ? matches.map(courseCard).join('') : '<div class="empty">No courses match your search. Try a course code, Python, or SFML.</div>'
}

function toolRow(id, index) {
  const tool = tools[id]
  return `<article class="tool-row"><span class="tool-number">${String(index + 1).padStart(2, '0')}</span><div class="tool-info"><h3>${tool.name} ${isDone(id) ? '<span class="done-label">✓ Complete</span>' : ''}</h3><p>${tool.description}</p></div><button class="button ${isDone(id) ? '' : 'primary'}" data-guide="${id}">${isDone(id) ? 'Review guide' : 'Install & set up'} ↗</button></article>`
}

function renderCourse(course) {
  const done = countDone(course)
  $('#detail-view').innerHTML = `<a class="back" href="#courses">← All course guides</a><div class="detail-heading"><div><div class="eyebrow">${course.code} · COURSE SETUP</div><h1>${course.name}</h1><p class="page-subtitle">${course.description}</p></div>${osPicker()}</div><div class="detail-meta"><span class="tag">${course.time} estimated</span><span class="page-subtitle">${done} of ${course.tools.length} tools complete for ${osNames[os]}</span></div><div class="progress-track" role="progressbar" aria-label="Course setup progress" aria-valuemin="0" aria-valuemax="${course.tools.length}" aria-valuenow="${done}"><span style="width:${100 * done / course.tools.length}%"></span></div><p class="page-subtitle">Follow this suggested order. Mark each guide complete after its verification step works.</p><div class="tool-list">${course.tools.map(toolRow).join('')}</div><div class="bottom-note"><span class="note-icon">i</span><div><strong>${done === course.tools.length ? 'You’re ready for your next project.' : 'Check your syllabus before installing.'}</strong><p>These are suggested tools, not confirmed requirements for every section. Your instructor’s versions and starter files take priority.</p></div></div>`
}

function renderOther(page) {
  if (page === 'toolkit') {
    $('#other-view').innerHTML = `<div class="detail-heading"><div><div class="eyebrow">EVERY TOOL, ONE PLACE</div><h1>Your software toolkit</h1><p class="page-subtitle">Installation guides shared across your courses.</p></div>${osPicker()}</div><div class="tool-list">${Object.keys(tools).map(toolRow).join('')}</div>`
  } else if (page === 'progress') {
    const total = Object.keys(tools).filter(isDone).length
    $('#other-view').innerHTML = `<div class="detail-heading"><div><div class="eyebrow">ONE STEP CLOSER</div><h1>Your setup progress</h1><p class="page-subtitle">${total} of ${Object.keys(tools).length} tools complete on ${osNames[os]}. Shared tools count toward every course that uses them.</p></div>${osPicker()}</div><div class="course-grid" style="margin:25px 0">${courses.map(courseCard).join('')}</div><p class="page-subtitle">Progress is saved in this browser, separately for each operating system. It does not sync between devices.</p><button class="button" id="reset-progress">Reset ${osNames[os]} progress</button><p class="page-subtitle" style="margin-bottom:40px">Reset only if you want to repeat your setup checklist.</p>`
  } else {
    $('#other-view').innerHTML = `<div class="help-layout"><div class="eyebrow">A HAND WHEN YOU NEED IT</div><h1>A smoother start.</h1><p class="page-subtitle">Installation guides help with the tools. Your instructor helps with the course.</p><details open><summary>Are these official course requirements?</summary><p>This is an independent student resource. Course names and numbers are based on Marist’s published program information. Tool selections are suggested examples, including Python for Introduction to Programming and C++ with SFML for Game Design & Programming I. Confirm your section’s languages, software versions, and starter projects with your instructor.</p></details><details><summary>A command isn’t recognized. What should I do?</summary><p>Close and reopen your terminal after installing. Check the installer’s PATH setting. On Windows, run Microsoft C++ commands in Developer PowerShell. On macOS and Linux, Python is usually available as python3. Follow the tool’s official documentation if the issue persists.</p></details><details><summary>Which SFML version should I use?</summary><p>Use your instructor’s assigned version. SFML 2 and SFML 3 have incompatible APIs. These example CMake instructions use an SFML 3 starter. Match the tutorial, compiler, architecture, and library version to your project.</p></details><details><summary>How do I install Python dependencies?</summary><p>Create a virtual environment using the Python guide, then use its Python executable with -m pip install followed by the package name. If your instructor provides requirements.txt, use -m pip install -r requirements.txt. Keep the provided dependency versions.</p></details><details><summary>Can I use a Mac or Linux computer for game programming?</summary><p>C++ and SFML are available across platforms. Visual Studio’s C++ IDE runs on Windows. The macOS and Linux paths here use VS Code with native compilers. Check with your instructor if assignments depend on Windows-specific tools. Linux commands here target Ubuntu and Debian.</p></details><details><summary>Why didn’t my progress save?</summary><p>Progress is stored locally in this browser. Private browsing, blocked storage, clearing site data, or switching browsers can remove it. Checklists record your confirmation and do not inspect installed software.</p></details><h2 style="margin-top:30px">Straight from the source</h2><a class="resource" href="https://www.marist.edu/computer-science" target="_blank" rel="noopener noreferrer">Marist Computer Science ↗<span>Program information and academic resources.</span></a><a class="resource" href="https://www.marist.edu/documents/d/guest/undergraduate-2023-2-" target="_blank" rel="noopener noreferrer">Marist undergraduate catalog, 2023–2024 ↗<span>Published course names and numbers. Consult your own catalog year and current syllabus.</span></a><a class="resource" href="https://www.sfml-dev.org/tutorials/3.0/" target="_blank" rel="noopener noreferrer">SFML 3 documentation ↗<span>Platform setup, API tutorials, and version-specific guidance.</span></a><a class="resource" href="https://www.marist.edu/information-technology" target="_blank" rel="noopener noreferrer">Marist Information Technology ↗<span>Campus technology assistance and support resources.</span></a></div>`
  }
}

function renderRoute() {
  const route = location.hash.slice(1) || 'courses'
  const course = route.startsWith('course/') ? courses.find(item => item.id === route.split('/')[1]) : null
  const page = ['toolkit', 'progress', 'help'].includes(route) ? route : 'courses'
  $('#home-view').hidden = !!course || page !== 'courses'
  $('#detail-view').hidden = !course
  $('#other-view').hidden = !!course || page === 'courses'
  $('#breadcrumb').textContent = course ? course.code : { courses: 'Course guides', toolkit: 'Software toolkit', progress: 'My progress', help: 'Help & resources' }[page]
  document.querySelectorAll('[data-nav]').forEach(link => {
    const active = link.dataset.nav === (course ? 'courses' : page)
    link.classList.toggle('active', active)
    if (active) link.setAttribute('aria-current', 'page')
    else link.removeAttribute('aria-current')
  })
  $('#os-select').value = os
  if (course) renderCourse(course)
  else if (page === 'courses') renderCatalog()
  else renderOther(page)
  document.title = `${course ? course.name : $('#breadcrumb').textContent} | Launchpad`
}

function openGuide(id) {
  activeGuide = id
  const tool = tools[id]
  $('#guide-body').innerHTML = `<div class="dialog-head"><div><div class="eyebrow">${osNames[os]} SETUP GUIDE</div><h2 id="guide-title">${tool.name}</h2></div><button class="close-button" aria-label="Close guide" data-close>×</button></div><div class="dialog-content"><div class="guide-note">${tool.note}</div>${tool[os].map((item, index) => `<div class="guide-step"><h3>${index + 1}. ${item.title}</h3><p>${item.text}</p>${item.command ? `<div class="command"><code></code><button class="copy-button" data-copy="${index}" aria-label="Copy command for step ${index + 1}">Copy</button></div>` : ''}</div>`).join('')}<a class="guide-source" href="${tool.source}" target="_blank" rel="noopener noreferrer">Official download ↗</a> <a class="guide-source" href="${tool.docs}" target="_blank" rel="noopener noreferrer">Full documentation ↗</a><div class="dialog-actions"><label><input type="checkbox" id="guide-complete" ${isDone(id) ? 'checked' : ''}> I’ve verified this setup works</label><button class="button primary" data-close>Done ✓</button></div></div>`
  let commandIndex = 0
  tool[os].forEach(item => {
    if (item.command) $('#guide-body').querySelectorAll('code')[commandIndex++].textContent = item.command
  })
  $('#guide-dialog').showModal()
}

document.addEventListener('click', async event => {
  const guideButton = event.target.closest('[data-guide]')
  if (guideButton) openGuide(guideButton.dataset.guide)
  if (event.target.closest('[data-close]')) $('#guide-dialog').close()
  const copyButton = event.target.closest('[data-copy]')
  if (copyButton) {
    const command = tools[activeGuide][os][Number(copyButton.dataset.copy)].command
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable')
      await navigator.clipboard.writeText(command)
      notify('Command copied to clipboard.')
    } catch { notify('Clipboard unavailable. Select and copy the command manually.') }
  }
  if (event.target.closest('#reset-progress')) {
    if (confirm(`Reset all setup checkmarks for ${osNames[os]} in this browser?`)) {
      completed = completed.filter(key => !key.startsWith(`${os}:`))
      persist()
      renderRoute()
      notify('Progress reset for this operating system.')
    }
  }
  const filterButton = event.target.closest('[data-filter]')
  if (filterButton) {
    filter = filterButton.dataset.filter
    document.querySelectorAll('[data-filter]').forEach(button => {
      button.classList.toggle('selected', button.dataset.filter === filter)
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter))
    })
    renderCatalog()
  }
})

document.addEventListener('change', event => {
  if (event.target.matches('#os-select, .detail-os')) {
    os = event.target.value
    persist()
    renderRoute()
  }
  if (event.target.id === 'guide-complete') {
    const key = `${os}:${activeGuide}`
    completed = completed.filter(item => item !== key)
    if (event.target.checked) completed.push(key)
    persist()
    renderRoute()
  }
})

$('#search').addEventListener('input', event => {
  query = event.target.value.trim().toLowerCase()
  renderCatalog()
})
document.addEventListener('keydown', event => {
  if (event.key === '/' && !$('#home-view').hidden && !$('#guide-dialog').open && !event.target.matches('input, textarea, select, [contenteditable]')) {
    event.preventDefault()
    $('#search').focus()
  }
})
$('#guide-dialog').addEventListener('click', event => {
  if (event.target === $('#guide-dialog')) {
    const rect = event.target.getBoundingClientRect()
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) event.target.close()
  }
})
window.addEventListener('hashchange', () => {
  renderRoute()
  window.scrollTo(0, 0)
  $('#main').focus({ preventScroll: true })
})
renderRoute()
