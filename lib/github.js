export async function fetchGithubUserData(username) {
  const userRes = await fetch(`https://api.github.com/users/${username}`);
  const user = await userRes.json();

  if (!user.login) {
    throw new Error(`GitHub user not found: ${username}`);
  }

  const reposRes = await fetch(user.repos_url);
  const repos = await reposRes.json();

  if (!Array.isArray(repos)) {
    console.error('GitHub repo API did not return an array:', repos);
    throw new Error('Invalid repo data');
  }

  const topLanguages = {};
  repos.forEach((repo) => {
    if (repo.language) {
      topLanguages[repo.language] = (topLanguages[repo.language] || 0) + 1;
    }
  });

  return {
    name: user.name,
    avatar: user.avatar_url,
    bio: user.bio,
    profileUrl: user.html_url,
    topLanguages: Object.entries(topLanguages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([lang]) => lang),
  };
}
