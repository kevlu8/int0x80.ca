import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const postsDirectory = path.join(process.cwd(), 'blogs');

export function getPostSlugs() {
  const categories = fs.readdirSync(postsDirectory);
  let slugs = [];
  categories.forEach(category => {
    const categoryPath = path.join(postsDirectory, category);
    const files = fs.readdirSync(categoryPath);
    files.forEach(file => {
      if (file.endsWith('.md')) {
        slugs.push({ category, slug: file.replace(/\.md$/, '') });
      }
    });
  });
  
  // Custom sorting: numbered files by number, others by date (newest first)
  slugs.sort((a, b) => {
    const numA = parseInt(a.slug.split('-')[0], 10);
    const numB = parseInt(b.slug.split('-')[0], 10);
    
    // If both have numbers at the beginning, sort by number
    if (!isNaN(numA) && !isNaN(numB)) {
      return numA - numB;
    }
    
    // If only one has a number, numbered files come first
    if (!isNaN(numA) && isNaN(numB)) return -1;
    if (isNaN(numA) && !isNaN(numB)) return 1;
    
    // If neither has a number, sort by date (newest first)
    const postA = getPostBySlug(a.category, a.slug);
    const postB = getPostBySlug(b.category, b.slug);
    const dateA = new Date(postA.data.date);
    const dateB = new Date(postB.data.date);
    return dateB - dateA;
  });
  
  return slugs;
}

export function getPostBySlug(category, slug) {
  const fullPath = path.join(postsDirectory, category, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');

  const { data, content } = matter(fileContents);

  return { data, content, category, slug };
}

export function getAllCategories() {
  return fs.readdirSync(postsDirectory);
}

export function getPostsByCategory(category) {
  const categoryPath = path.join(postsDirectory, category);
  
  const files = fs.readdirSync(categoryPath);
  return files
	.filter(file => file.endsWith('.md'))
	.map(file => {
	  const slug = file.replace(/\.md$/, '');
	  const { data } = getPostBySlug(category, slug);
	  return { data, slug };
	})
	.sort((a, b) => {
	  const numA = parseInt(a.slug.split('-')[0], 10);
	  const numB = parseInt(b.slug.split('-')[0], 10);
	  
	  // If both have numbers at the beginning, sort by number
	  if (!isNaN(numA) && !isNaN(numB)) {
	    return numA - numB;
	  }
	  
	  // If only one has a number, numbered files come first
	  if (!isNaN(numA) && isNaN(numB)) return -1;
	  if (isNaN(numA) && !isNaN(numB)) return 1;
	  
	  // If neither has a number, sort by date (newest first)
	  const dateA = new Date(a.data.date);
	  const dateB = new Date(b.data.date);
	  return dateB - dateA;
	});
}

export function getCategoryDescription(category) {
  try {
    const descPath = path.join(postsDirectory, category, 'desc.txt');
    return fs.readFileSync(descPath, 'utf8').trim();
  } catch (error) {
    return 'Explore articles in this category.';
  }
}

export function getAllCategoriesWithDescriptions() {
  const categories = getAllCategories();
  return categories.map(category => ({
    name: category,
    description: getCategoryDescription(category)
  }));
}
