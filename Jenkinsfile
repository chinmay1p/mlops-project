pipeline {
    agent any

    options {
        timestamps()
    }

    environment {
        DOCKER = 'C:\\Users\\User\\AppData\\Local\\Programs\\DockerDesktop\\resources\\bin\\docker.exe'
        COMPOSE = 'C:\\Users\\User\\.docker\\cli-plugins\\docker-compose.exe'
        COMPOSE_FILE = 'docker-compose.yml'
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/chinmay1p/mlops-project.git'
            }
        }

        stage('Show Workspace') {
            steps {
                bat 'echo Workspace: %cd%'
                bat 'git status'
                bat 'dir'
            }
        }

        stage('Check Docker') {
            steps {
                bat '"%DOCKER%" --version'
                bat '"%COMPOSE%" version'
                bat '"%DOCKER%" info'
            }
        }

        stage('Build Images') {
            steps {
                bat '"%COMPOSE%" -f "%COMPOSE_FILE%" build'
            }
        }

        stage('Deploy Containers') {
            steps {
                bat '"%COMPOSE%" -f "%COMPOSE_FILE%" up -d'
            }
        }

        stage('Show Container Status') {
            steps {
                bat '"%COMPOSE%" -f "%COMPOSE_FILE%" ps'
            }
        }
    }

    post {
        always {
            echo 'Pipeline execution completed.'
        }

        success {
            echo 'Build and deployment completed successfully.'
        }

        failure {
            echo 'Pipeline failed. Check stage logs above.'
        }
    }
}
