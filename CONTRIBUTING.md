# Contributing to Anime Tracker

Thank you for your interest in contributing! This guide will help you get started.

## 🎯 Ways to Contribute

### 🐛 Report Bugs
Found a bug? Please create an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS info

### 💡 Suggest Features
Have an idea? Share it!
- Description of the feature
- Why it would be useful
- How it should work
- Any relevant examples

### 🔧 Contribute Code

#### Setup Development Environment
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/anime-tracker.git
cd anime-tracker

# Install dependencies
npm install

# Start development server
npm run dev
```

#### Code Guidelines
- Follow existing code style
- Use TypeScript for type safety
- Write meaningful commit messages
- Test your changes locally
- Keep commits atomic and focused

#### Making Changes
1. Create a feature branch: `git checkout -b feature/amazing-feature`
2. Make your changes
3. Test thoroughly: `npm run build && npm run dev`
4. Commit: `git commit -m "feat: add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

#### Commit Message Format
```
feat: add new feature description
fix: resolve bug description
docs: update documentation
style: code formatting changes
refactor: code restructuring
perf: performance improvements
test: add or update tests
```

### 📚 Improve Documentation
- Fix typos
- Clarify instructions
- Add examples
- Translate to other languages

### 🎨 Design Improvements
- Suggest UI/UX enhancements
- Design mockups
- Accessibility improvements
- Animation ideas

## 🏗️ Project Structure

```
src/
├── app/                 # Next.js app pages
├── components/          # React components
├── lib/                 # Utilities & helpers
├── types.ts             # TypeScript types
└── store.ts             # State management
```

## 📋 Development Guidelines

### Component Structure
```typescript
'use client';

import { motion } from 'framer-motion';
import { Icon } from 'lucide-react';

interface ComponentProps {
  // Props definition
}

export function ComponentName({ ...props }: ComponentProps) {
  // Component logic
  return (
    // JSX
  );
}
```

### Styling
- Use Tailwind CSS classes
- Add dark mode support with `dark:` prefix
- Use semantic color variables
- Maintain glassmorphism aesthetic

### Type Safety
- Always define prop types
- Use TypeScript interfaces
- Avoid `any` types
- Export shared types from `types.ts`

### State Management
- Use Zustand for global state
- Keep store logic simple
- Name action functions clearly
- Document complex selectors

## 🧪 Testing

### Manual Testing
- Test on multiple browsers
- Test responsive design (mobile/tablet/desktop)
- Test with/without localStorage
- Test dark/light mode
- Test all CRUD operations
- Test Excel import/export

### Code Quality
```bash
# Build check
npm run build

# Lint check
npm run lint

# Type check
npx tsc --noEmit
```

## 📦 Dependencies

### When Adding Dependencies
- Keep bundle size in mind
- Check if something built-in can be used
- Prefer widely-used libraries
- Check license compatibility (MIT preferred)

### Current Stack
- **Next.js**: Web framework
- **React**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling
- **Framer Motion**: Animations
- **Zustand**: State management
- **XLSX**: Excel handling
- **Lucide React**: Icons

## 🚀 Feature Ideas

Here are some features we're interested in:

- [ ] MyAnimeList API integration
- [ ] AniList API integration
- [ ] Statistics dashboard
- [ ] Advanced search filters
- [ ] Genre-based recommendations
- [ ] Cloud backup sync
- [ ] Social sharing features
- [ ] Watch history timeline
- [ ] Rating statistics
- [ ] Mobile app (React Native)

Feel free to pick one and contribute!

## 📝 Documentation

When adding features:
1. Update README.md if needed
2. Update SETUP.md with new steps
3. Add code comments for complex logic
4. Document new types and interfaces

## 🙏 Code Review Process

1. Submit PR with clear description
2. Address feedback from reviewers
3. Keep discussion professional
4. Update PR based on feedback
5. PR gets merged when approved

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 💬 Community

- Be respectful and professional
- Help others with their questions
- Share ideas constructively
- Give credit where due

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)

## 🐛 Known Issues

Check GitHub issues for known bugs and limitations.

## ✅ Checklist Before PR

- [ ] Code follows style guidelines
- [ ] Changes tested locally
- [ ] No console warnings/errors
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Commit messages are clear
- [ ] Branch is up-to-date with main

## 📧 Questions?

Feel free to ask! Open an issue or discussion for questions.

---

**Thank you for contributing!** 🎌✨

Your contributions help make Anime Tracker better for everyone!
