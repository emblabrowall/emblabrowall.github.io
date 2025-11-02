
  # Exchange Student Guide Website

  This is a code bundle for Exchange Student Guide Website. The original project is available at https://www.figma.com/design/oLCcvrD2XYVH6LkWpYluus/Exchange-Student-Guide-Website.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Deployment to GitHub Pages

  This project is configured to deploy to GitHub Pages. You have two options:

  ### Option 1: Automatic Deployment (Recommended)

  The repository includes a GitHub Actions workflow that automatically builds and deploys when you push to the `main` branch. Just:
  1. Push your changes to the `main` branch
  2. Go to your repository Settings → Pages
  3. Under "Source", select "GitHub Actions"
  4. The workflow will automatically build and deploy your site

  ### Option 2: Manual Deployment

  1. Run `npm run build` to build the project
  2. Commit and push the `docs` folder (the build output)
  3. Go to your repository Settings → Pages
  4. Under "Source", select "Deploy from a branch"
  5. Choose "main" branch and "docs" folder
  6. Click Save

  After deployment, your site will be available at `https://emblabrowall.github.io`
  