#!/usr/bin/env bun

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';

// Setup paths
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, '..', 'src', 'content', 'tldr');

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper function to prompt for input
function prompt(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Generate a slug from a title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Remove consecutive hyphens
    .trim();
}

// Main function
async function createNewTldr() {
  console.log('📝 Create a new TLDR\n');
  
  // Get TLDR details
  const title = await prompt('Title: ');
  
  // Get tags
  const tagsInput = await prompt('Tags (comma-separated): ');
  const tags = tagsInput
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
  
  // Generate slug from title
  const slug = generateSlug(title);
  
  // Get the current date
  const now = new Date();
  const date = now.toISOString();
  
  // Create the frontmatter
  const frontmatter = `---
title: "${title}"
date: ${date}
tags: [${tags.map(tag => `"${tag}"`).join(', ')}]
draft: false
---

# ${title}

`;

  // Create the file
  const filePath = path.join(contentDir, `${slug}.md`);
  
  // Check if file already exists
  if (fs.existsSync(filePath)) {
    console.error(`⚠️ A TLDR with the slug "${slug}" already exists.`);
    rl.close();
    return;
  }
  
  // Write the file
  fs.writeFileSync(filePath, frontmatter);
  
  console.log(`\n✅ TLDR created at: ${filePath}`);
  
  rl.close();
}

// Run the main function
createNewTldr().catch(error => {
  console.error('Error creating TLDR:', error);
  rl.close();
  process.exit(1);
});
