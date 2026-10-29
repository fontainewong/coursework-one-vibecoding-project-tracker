import { CONTEXT_TEMPLATE, WORKSPACE_KEY, emptyLinks } from './model.js';
import { demoUsers, demoProject, seedWorkspace, sampleContext, smallTeamProject, demoLinks, presentationProject } from './seedData.js';

// Upgrade only old schema/demo defaults; never replace user-written task context.
export function upgradeWorkspace(data) {
  const defaults = demoUsers();
  const users = defaults.map((demo) => ({ ...demo, ...data.users.find((user) => user.id === demo.id), isDemo: true }));
  const userIds = new Set(users.map((user) => user.id));
  const oldSamples = ['task-search-filters', 'task-date-fix', 'task-form-validation', 'task-ci-build'];
  const projects = [...data.projects];
  const needsSeedUpdate = (data.schemaRevision || 0) < 4;
  const needsCoverageUpdate = (data.schemaRevision || 0) < 5;
  const hasSeedProject = projects.some((project) => ['demo-project', 'seed-demo-project'].includes(project.id));
  if (needsSeedUpdate && hasSeedProject && !projects.some((project) => project.id === 'demo-small-team')) projects.push(smallTeamProject());
  const needsTeamSpaceUpdate = (data.schemaRevision || 0) < 6;
  const needsShowcaseUpdate = (data.schemaRevision || 0) < 7;
  if (needsShowcaseUpdate && hasSeedProject && !projects.some((project) => project.id === 'demo-presentation')) projects.push(presentationProject());
  return { ...data, schemaRevision: 7, users, projects: projects.map((project) => {
    const isPrimarySeed = ['demo-project', 'seed-demo-project'].includes(project.id);
    const isSmallSeed = project.id === 'demo-small-team';
    let membership = needsCoverageUpdate && isSmallSeed ? [...new Set([...project.memberUserIds, 'demo-1', 'demo-2', 'demo-3'])] : project.memberUserIds;
    if (needsTeamSpaceUpdate && (isPrimarySeed || isSmallSeed) && membership.length > 6) {
      membership = isPrimarySeed ? membership.filter((id) => !['demo-5', 'demo-8'].includes(id)).slice(0, 6) : membership.slice(0, 6);
    }
    if (needsShowcaseUpdate && isPrimarySeed) membership = membership.filter((id) => id !== 'demo-3');
    if (needsShowcaseUpdate && isSmallSeed) membership = membership.filter((id) => id !== 'demo-2');
    const memberUserIds = membership.filter((id) => userIds.has(id));
    // Keep imported work accessible when all its old members were removed.
    if (!memberUserIds.length && project.memberUserIds.length) memberUserIds.push('demo-1');
    const sourceTasks = [...project.tasks];
    if (needsCoverageUpdate && (isPrimarySeed || isSmallSeed)) {
      const example = isSmallSeed ? smallTeamProject() : demoProject();
      const newTaskIds = isSmallSeed ? ['small-task-4', 'small-task-5'] : ['demo-task-8', 'demo-task-9', 'demo-task-10'];
      sourceTasks.push(...example.tasks.filter((task) => newTaskIds.includes(task.id) && !sourceTasks.some((existing) => existing.id === task.id)).map((task) => ({ ...task, projectId: project.id })));
    }
    const tasks = sourceTasks.map((original) => {
      const replacement = needsTeamSpaceUpdate && isPrimarySeed ? { 'demo-task-6': ['demo-5', 'demo-4'], 'demo-task-10': ['demo-8', 'demo-6'] }[original.id] : null;
      let task = replacement && original.assigneeUserId === replacement[0] ? { ...original, assigneeUserId: replacement[1] } : original;
      if (needsShowcaseUpdate && isPrimarySeed && task.id === 'demo-task-3' && task.assigneeUserId === 'demo-3') task = { ...task, assigneeUserId: 'demo-1' };
      if (needsShowcaseUpdate && isSmallSeed && task.id === 'small-task-1' && task.assigneeUserId === 'demo-2') task = { ...task, assigneeUserId: 'demo-3' };
      const isSample = /^demo-task-\d+$/.test(task.id) || oldSamples.includes(task.id);
      const emptySample = (data.schemaRevision || 0) < 3 && isSample && (!task.context?.trim() || task.context === CONTEXT_TEMPLATE);
      return { ...task, assigneeUserId: userIds.has(task.assigneeUserId) && memberUserIds.includes(task.assigneeUserId) ? task.assigneeUserId : null,
        ...(emptySample ? { context: sampleContext(task), contextTool: task.contextTool || 'ChatGPT', contextUpdatedAt: task.contextUpdatedAt || new Date().toISOString() } : {}) };
    });
    const anchors = emptyLinks(project.id).map((definition) => {
      const old = project.anchors?.find((item) => item.id === definition.id || item.type === definition.type);
      let links = old?.links?.length ? old.links : (old?.url ? [{ id: `imported-link:${project.id}:${definition.id}`, title: definition.label, url: old.url }] : []);
      if (needsCoverageUpdate && (isPrimarySeed || isSmallSeed) && !links.length) links = demoLinks(project.id).find((group) => group.type === definition.type).links;
      if (needsShowcaseUpdate && (isPrimarySeed || isSmallSeed) && ['report', 'documentation'].includes(definition.type)) links = links.filter((link) => !link.id?.startsWith('seed-live-demo:') || link.url !== 'https://coursework-one-vibecoding-project-t.vercel.app/');
      return { ...definition, links: links.map((link) => ({ ...link, projectId: project.id, type: definition.type })) };
    });
    const milestones = [...(project.milestones || [])];
    if (needsShowcaseUpdate && (isPrimarySeed || isSmallSeed)) {
      const example = isSmallSeed ? smallTeamProject() : demoProject();
      milestones.push(...example.milestones.slice(1).filter((item) => !milestones.some((existing) => existing.id === item.id)));
    }
    return { ...project, memberUserIds, tasks, anchors, milestones: milestones.map((item) => ({ ...item, projectId: project.id,
      description: item.description || '', taskIds: (item.taskIds || []).filter((id) => tasks.some((task) => task.id === id)) })) };
  }) };
}

// Legacy keys are retained as a backup; migration writes only the version 2 key.
export function migrateWorkspace(legacy) {
  if (legacy.version === 2) return legacy;
  const users = demoUsers();
  const projects = (legacy.teams || []).map((team, projectIndex) => {
    const projectId = team.id || `legacy-project-${projectIndex}`;
    const members = [...(team.members || [])];
    for (const task of team.tasks || []) {
      if (task.assignee?.trim() && !members.some((member) => member.name === task.assignee)) members.push({ name: task.assignee });
    }
    const nameToId = new Map();
    const memberUserIds = [];
    members.forEach((member, index) => {
      const email = member.email?.trim() || `${member.name.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
      let user = users.find((item) => item.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        user = { ...member, id: `legacy:${projectId}:${member.id || index}`, name: member.name, email,
          password: member.password || null, githubUsername: member.githubUsername || '' };
        users.push(user);
      }
      nameToId.set(member.name, user.id);
      if (!memberUserIds.includes(user.id)) memberUserIds.push(user.id);
    });
    // The first demo user can access pre-login projects after migration.
    if (!memberUserIds.includes('demo-1')) memberUserIds.push('demo-1');
    const tasks = (team.tasks || []).map((task) => {
      const { assignee, ...rest } = task;
      return { ...rest, projectId, assigneeUserId: assignee ? nameToId.get(assignee) ?? null : null };
    });
    const anchors = emptyLinks(projectId).map((definition) => ({ ...definition, ...team.anchors?.find((anchor) => anchor.id === definition.id), projectId, type: definition.id }));
    return { ...team, id: projectId, name: team.name || 'Imported project', memberUserIds, tasks, anchors,
      milestones: (team.milestones || []).map((item) => ({ ...item, projectId })) };
  }).map(({ members, ...project }) => project);
  const demo = demoProject();
  if (projects.some((project) => project.id === demo.id)) {
    demo.id = 'seed-demo-project';
    demo.tasks = demo.tasks.map((task) => ({ ...task, projectId: demo.id }));
    demo.milestones = demo.milestones.map((item) => ({ ...item, projectId: demo.id }));
    demo.anchors = emptyLinks(demo.id);
  }
  projects.push(demo);
  return { version: 2, users, projects, activeProjectId: projects.find((project) => project.id === legacy.activeTeamId)?.id || projects[0].id };
}

export function loadWorkspace(storage, { resetDemo = false } = {}) {
  if (resetDemo) return upgradeWorkspace(seedWorkspace());
  const current = storage.getItem(WORKSPACE_KEY);
  if (current !== null) {
    const data = JSON.parse(current);
    if (data.version !== 2 || !Array.isArray(data.users) || !Array.isArray(data.projects)) throw new Error('Saved workspace could not be read. Your saved data has not been replaced.');
    return upgradeWorkspace(data);
  }
  const legacy = storage.getItem('vibetracker.workspace.v1');
  if (legacy !== null) return upgradeWorkspace(migrateWorkspace(JSON.parse(legacy)));
  const tasks = storage.getItem('vibetracker.tasks');
  const anchors = storage.getItem('vibetracker.anchors');
  if (tasks !== null || anchors !== null) return upgradeWorkspace(migrateWorkspace({ activeTeamId: 'starter', teams: [{ id: 'starter', name: 'Team starter', members: [], tasks: tasks ? JSON.parse(tasks) : [], anchors: anchors ? JSON.parse(anchors) : [] }] }));
  return upgradeWorkspace(seedWorkspace());
}
