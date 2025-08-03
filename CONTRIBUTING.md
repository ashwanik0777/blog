# 🤝 Contributing to Gemini AI Blog

Thank you for your interest in contributing to Gemini AI Blog! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [🌟 Getting Started](#-getting-started)
- [🔧 Development Setup](#-development-setup)
- [📝 Code Standards](#-code-standards)
- [🚀 Pull Request Process](#-pull-request-process)
- [🐛 Bug Reports](#-bug-reports)
- [💡 Feature Requests](#-feature-requests)
- [📚 Documentation](#-documentation)
- [🧪 Testing](#-testing)

---

## 🌟 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- MongoDB Atlas account (for testing)
- Google Gemini API key

### Quick Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/gemini-ai-blog.git
   cd gemini-ai-blog
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

---

## 🔧 Development Setup

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (admin)/           # Admin route group
│   ├── (auth)/            # Authentication routes
│   ├── (blog)/            # Public blog routes
│   └── api/               # API endpoints
├── components/            # Reusable UI components
├── lib/                   # Utility libraries
├── models/                # MongoDB schemas
└── middleware.ts          # Next.js middleware
```

### Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix          # Fix ESLint issues

# Database
npm run db:seed          # Seed database with sample data
npm run db:reset         # Reset database

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# Authentication
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## 📝 Code Standards

### TypeScript Guidelines

- Use strict TypeScript configuration
- Define proper interfaces for all data structures
- Avoid `any` type - use proper typing
- Use generics where appropriate

```typescript
// ✅ Good
interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: User;
  publishedAt: Date;
}

// ❌ Avoid
const blog: any = { title: "My Blog" };
```

### Component Guidelines

- Use functional components with hooks
- Implement proper prop interfaces
- Use meaningful component names
- Keep components focused and single-purpose

```typescript
// ✅ Good
interface BlogCardProps {
  blog: BlogPost;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function BlogCard({ blog, onEdit, onDelete }: BlogCardProps) {
  // Component implementation
}
```

### Styling Guidelines

- Use Tailwind CSS classes
- Follow mobile-first responsive design
- Maintain consistent spacing and colors
- Use semantic class names

```tsx
// ✅ Good
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
    Blog Title
  </h2>
</div>
```

### API Guidelines

- Use proper HTTP status codes
- Implement error handling
- Validate input data
- Return consistent response formats

```typescript
// ✅ Good
export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Validate input
    if (!data.title || !data.content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Process request
    const result = await createBlog(data);
    
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## 🚀 Pull Request Process

### Before Submitting

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow code standards
   - Add tests for new features
   - Update documentation

3. **Test your changes**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new AI-powered blog generation feature"
   ```

### Commit Message Format

Use conventional commit messages:

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Build/tool changes

Examples:
```
feat(ai): add blog content generation with Gemini AI
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
```

### Pull Request Guidelines

1. **Title**: Clear and descriptive
2. **Description**: Explain what and why, not how
3. **Screenshots**: Include for UI changes
4. **Tests**: Ensure all tests pass
5. **Documentation**: Update relevant docs

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
```

---

## 🐛 Bug Reports

### Before Reporting

1. Check existing issues
2. Try to reproduce the bug
3. Check browser console for errors
4. Test in different browsers

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS, Windows, Linux]
- Browser: [e.g., Chrome, Firefox, Safari]
- Version: [e.g., 22]

## Additional Information
Screenshots, console logs, etc.
```

---

## 💡 Feature Requests

### Before Requesting

1. Check existing feature requests
2. Consider if it aligns with project goals
3. Think about implementation complexity

### Feature Request Template

```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this work?

## Alternatives Considered
Other approaches you considered

## Additional Context
Screenshots, mockups, etc.
```

---

## 📚 Documentation

### Documentation Standards

- Use clear, concise language
- Include code examples
- Add screenshots for UI features
- Keep documentation up-to-date

### Documentation Types

1. **Code Documentation**
   - JSDoc comments for functions
   - README files for components
   - API documentation

2. **User Documentation**
   - Installation guides
   - Usage instructions
   - Troubleshooting guides

3. **Developer Documentation**
   - Architecture overview
   - Development setup
   - Contributing guidelines

---

## 🧪 Testing

### Testing Guidelines

- Write tests for new features
- Maintain test coverage above 80%
- Use meaningful test descriptions
- Test both success and error cases

### Test Structure

```typescript
describe('Blog API', () => {
  describe('POST /api/blog', () => {
    it('should create a new blog post', async () => {
      // Test implementation
    });
    
    it('should return 400 for invalid data', async () => {
      // Test implementation
    });
  });
});
```

### Testing Commands

```bash
npm run test              # Run all tests
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Generate coverage report
npm run test:e2e          # Run end-to-end tests
```

---

## 🎯 Areas for Contribution

### High Priority

- [ ] AI feature enhancements
- [ ] Performance optimizations
- [ ] Security improvements
- [ ] Mobile responsiveness
- [ ] Accessibility improvements

### Medium Priority

- [ ] Additional analytics features
- [ ] Social media integration
- [ ] Email newsletter templates
- [ ] Multi-language support
- [ ] Advanced search functionality

### Low Priority

- [ ] UI/UX improvements
- [ ] Code refactoring
- [ ] Documentation updates
- [ ] Test coverage improvements

---

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and ideas
- **Pull Requests**: For code contributions

### Code of Conduct

- Be respectful and inclusive
- Help others learn and grow
- Provide constructive feedback
- Follow project guidelines

---

## 🙏 Recognition

Contributors will be recognized in:

- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors page

---

Thank you for contributing to Gemini AI Blog! 🚀

<div align="center">

**Made with ❤️ by the community**

</div> 