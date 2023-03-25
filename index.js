const https = require('https');
const cheerio = require('cheerio');
const fs = require('fs');

// Scrape the trending repositories
https.get('https://github.com/trending', res => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    const $ = cheerio.load(data);
    const repos = [];

    $('article').each((i, el) => {
      const repoTitle = $(el).find('.h3 > a').text().trim();
      const repoDescription = $(el).find('p').text().trim();
      const repoUrl = 'https://github.com' + $(el).find('.h3 > a').attr('href');
      const repoStars = $(el).find('.octicon-star').parent().text().trim();
      const repoForks = $(el).find('.octicon-repo-forked').parent().text().trim();
      const repoLanguage = $(el).find('.repo-language-color + span').text().trim();

      repos.push({
        title: repoTitle,
        description: repoDescription,
        url: repoUrl,
        stars: repoStars,
        forks: repoForks,
        language: repoLanguage
      });
    });

    fs.writeFileSync('trending-repos.json', JSON.stringify(repos, null, 2));
    console.log('Trending repositories data saved to trending-repos.json');
  });
}).on('error', error => {
  console.error(error);
});

// Scrape the top developers
https.get('https://github.com/trending/developers?since=daily&spoken_language_code=javascript', res => {
  let data = '';

  res.on('data', chunk => {
    data += chunk;
  });

  res.on('end', () => {
    const $ = cheerio.load(data);
    const devs = [];

    $('li .col-md-6').each((i, el) => {
      const devName = $(el).find('.h3 > a').text().trim();
      const devUsername = $(el).find('.h3 > a').attr('href').slice(1);
      const devRepo = {
        name: $(el).find('h1 > a').text().trim(),
        description: $(el).find('.col-9 > p').text().trim()
      };

      devs.push({
        name: devName,
        username: devUsername,
        repo: devRepo
      });
    });

    fs.writeFileSync('top-devs.json', JSON.stringify(devs, null, 2));
    console.log('Top developers data saved to top-devs.json');
  });
}).on('error', error => {
  console.error(error);
});

const trendingRepos = JSON.parse(fs.readFileSync('trending-repos.json', 'utf-8').replace(/\n|\r/g, ''));
console.log('Trending repositories:');
console.log(trendingRepos);

const topDevs = JSON.parse(fs.readFileSync('top-devs.json', 'utf-8').replace(/\n|\r/g, ''));
console.log('Top developers:');
console.log(topDevs);