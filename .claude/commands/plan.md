---
description: Écrire les tests AVANT le code et les faire relire par un humain. Skippable pour les besoins DevOps/infra où les tests ne sont pas pertinents. Produit tests d'archi + tests BDD + tests unitaires TDD. Ne passe à /build qu'après validation user des tests RED.
---

# 🧪 Plan — Tests & Relecture humaine

Tu écris **tous les tests** correspondant à un besoin, **avant** toute ligne de code, et tu les soumets à validation humaine. Trois niveaux :

1. **Tests d'architecture** (archi / couches / dépendances)
2. **Tests BDD** (Cucumber/Gherkin — un scenario du need = un scenario feature exécutable)
3. **Tests unitaires** (TDD ciblé sur la logique domain complexe)

Tous les tests doivent être **déterministes** : pas de `sleep`, pas de random non-seeded, pas de dépendance réseau sans mock/testcontainer.

## Skip — quand cette étape n'est pas pertinente

Certains besoins ne justifient pas de tests écrits en amont :
- **Infrastructure/DevOps** (Terraform, Ansible, pipelines CI/CD) — tests d'intégration après `apply`, pas de BDD pertinent
- **Configuration** (YAML, env vars, feature flags) — validation par dry-run, pas par tests unitaires
- **Documentation** (README, ADR, runbooks) — pas de code à tester

Si le besoin tombe dans ces catégories, proposer : *"Ce besoin est DevOps/infra — /plan peut être skippé. Passer directement à /build ? [y/N]"*

Si `y` → passer directement à `/build`. Ajouter dans Backlog `## Notes` : `[{date}] /plan : skippé (besoin infra/devops)`.

## Input

- Le `/task` vient d'être validé (chaînage automatique), OU
- L'task Backlog courante (depuis `/pick` ou invocation directe)
- Le fichier need du contexte projet : `.grace/needs/<feature>.md`
- La stack technique du projet (lue depuis `CLAUDE.md` → Tech Stack)

## Workflow

### 1. Détecter le langage et choisir les outils

Lire `CLAUDE.md` → section Tech Stack → langage principal. Mapper selon cette matrice :

| Langage | Unit | Archi | BDD | E2E UI |
|---|---|---|---|---|
| **Java / Kotlin / Spring** | JUnit 5 + Mockito | **ArchUnit** (dans `src/test/java/.../ArchTest.java` + `archunit.properties`) | **Cucumber JVM** (`src/test/features/*.feature` + step defs en `src/test/java`) | Playwright Java |
| **TypeScript / JavaScript** (Node / Vite / Next) | Vitest (préféré) ou Jest | **dependency-cruiser** (`.dependency-cruiser.cjs`) | **Cucumber.js** (`features/*.feature` + step defs en TS) | Playwright |
| **Go** | `go test` natif | **go-arch-lint** ou `depguard` | **godog** (Cucumber for Go) | Playwright JS qui pilote le binaire Go en arrière-plan |
| **Python** | pytest | **import-linter** (`.importlinter`) | **behave** ou **pytest-bdd** | Playwright Python |
| **Ansible / Terraform** | Molecule (Ansible), `terraform test` | tflint / ansible-lint | — (rarement BDD) | Testinfra (Ansible), terratest (TF) |

Si la stack n'est pas dans la matrice : demander à l'utilisateur les outils à utiliser + ajouter un log dans `CLAUDE.md` → Tech Stack.

### 2. Tests d'architecture (SI pertinent)

Tests d'archi = **garde-fou permanent** qui vérifie les règles DDD (domain pure, couches, dépendances). Tourne au build, échec = commit bloqué.

**Quand les écrire** : seulement si le projet a une architecture explicite (DDD hexagonale, clean archi, layered). Pas la peine pour un script.

**Règles standard à encoder** (adapter au langage) :

1. **Domain Purity** : `src/domain/**` ne doit importer que de `src/domain/**` ou de la stdlib. Pas de framework, DB, HTTP.
2. **Direction des dépendances** : `infrastructure/` peut dépendre de `domain/` et `usecases/`, jamais l'inverse.
3. **Naming conventions** : classes dans `domain/` ne finissent pas par `Service`, `Controller`, `Repository` (patterns techniques).
4. **Packages metier** : pas de cyclic dependencies entre bounded contexts.

**Exemple Java (ArchUnit)** :

```java
@AnalyzeClasses(packages = "com.myapp", importOptions = DoNotIncludeTests.class)
class ArchitectureTest {

    @ArchTest
    static final ArchRule domain_should_not_depend_on_infrastructure =
        noClasses().that().resideInAPackage("..domain..")
            .should().dependOnClassesThat().resideInAnyPackage(
                "..infrastructure..", "..usecases..",
                "org.springframework..", "jakarta.persistence.."
            );

    @ArchTest
    static final ArchRule hexagonal_layers =
        layeredArchitecture().consideringAllDependencies()
            .layer("Domain").definedBy("..domain..")
            .layer("UseCases").definedBy("..usecases..")
            .layer("Infrastructure").definedBy("..infrastructure..")
            .whereLayer("Infrastructure").mayNotBeAccessedByAnyLayer()
            .whereLayer("UseCases").mayOnlyBeAccessedByLayers("Infrastructure")
            .whereLayer("Domain").mayOnlyBeAccessedByLayers("UseCases", "Infrastructure");
}
```

**Exemple TypeScript (dependency-cruiser)** :

```js
// .dependency-cruiser.cjs
module.exports = {
  forbidden: [
    { name: 'no-domain-to-infra', severity: 'error', comment: 'Domain pure',
      from: { path: 'src/domain' },
      to:   { path: 'src/(infrastructure|usecases)|node_modules' } },
    { name: 'no-circular', severity: 'error', from: {}, to: { circular: true } }
  ]
};
```

Exécution :
- Java : `mvn test -Dtest=ArchitectureTest`
- TS : `npx depcruise --config .dependency-cruiser.cjs src`
- Go : `go-arch-lint check`
- Python : `lint-imports`

### 3. Tests BDD (Cucumber/Gherkin) — l'épine dorsale

**Chaque scenario Given/When/Then du `need.md` du contexte projet → un scenario `.feature` exécutable**.

**Convention de fichier** :
- Java : `src/test/features/<module>/<feature-slug>.feature` (style seed4j)
- TS : `features/<module>/<feature-slug>.feature`
- Go : `features/<feature-slug>.feature`
- Python : `features/<feature-slug>.feature`

**Exemple de `.feature`** (traduit mot-à-mot depuis le need du contexte projet) :

```gherkin
Feature: Authentification OIDC

  Scenario: Connexion réussie (happy path)
    Given un utilisateur non authentifié
    When il clique sur "Se connecter avec OIDC"
    Then il est redirigé vers l'IdP
    And après validation il revient authentifié

  Scenario: Refus de l'IdP
    Given un utilisateur non authentifié
    When l'IdP refuse le login
    Then il revient avec un message d'erreur clair
    And il n'est pas authentifié

  Scenario: Session expirée
    Given un utilisateur authentifié depuis 31 minutes sans activité
    When il tente une action
    Then il est redirigé vers la page de login
```

**Step definitions** : une par phrase Gherkin, dans le dossier steps du framework choisi (Java `@Given`, `@When`, `@Then`; TS `Given(...)`; Python `@given(...)`).

**Règle de déterminisme** :
- Aucun `Thread.sleep` / `setTimeout` de temps fixe. Utiliser des conditions d'attente (awaitility Java, playwright `waitFor`).
- Aucune dépendance à un ordre d'exécution entre scenarios. Chaque scenario démarre avec un état propre (fixtures / `@Before`).
- Les dates : injecter un `Clock` / freezer (`Clock.fixed()`, `sinon.useFakeTimers`, `freezegun`).
- Les appels externes (HTTP, DB) : stub / WireMock / testcontainer.

### 4. Tests unitaires (TDD ciblé)

Uniquement pour la **logique domain complexe** : algorithmes, value objects avec invariants, calculs métier non triviaux.

**Ne PAS écrire** de tests unitaires pour :
- Un simple getter/setter
- Un contrôleur qui ne fait qu'appeler un use case (le scenario BDD couvre)
- Un adapter sans logique

**Format** : un fichier test par classe, noms de tests en `should_<comportement>_when_<contexte>`.

### 5. Produire le plan de tests et présenter

Avant d'écrire quoi que ce soit, présenter le **plan de tests** structuré :

```
## Plan de tests — <feature-slug>

### 1. Tests d'architecture (si applicable)
- [ ] Domain Purity : `src/domain/**` sans dépendance externe
- [ ] Hexagonal layers : direction des imports respectée
- [ ] Naming : pas de Service/Controller dans domain

### 2. Tests BDD (Cucumber) — 1 par scenario du need
- [ ] `features/auth-oidc.feature`
  - Scenario: Happy path (depuis need)
  - Scenario: Refus IdP
  - Scenario: Session expirée
- Step definitions à créer : [liste]

### 3. Tests unitaires ciblés
- [ ] `TokenValidatorTest` : validation du token JWT (logique métier non triviale)
- [ ] `SessionTimeoutCalculatorTest` : calcul du timeout avec Clock injecté

### 4. Outils mobilisés
- Unit : <framework>
- Archi : <ArchUnit / dep-cruiser / go-arch-lint / import-linter>
- BDD : <Cucumber JVM / Cucumber.js / godog / behave>
- E2E UI : <Playwright — si UI, sinon "non applicable">

### 5. Règles de déterminisme vérifiées
- Pas de sleep fixe
- Clock injecté pour les dates
- Stubs / WireMock / testcontainers pour les externalités
```

### 6. Demander la validation user

**NE PAS ÉCRIRE LES TESTS** tant que l'utilisateur n'a pas validé ce plan.

```
❓ Plan de tests OK ? (go / ajuste)
```

Accepter :
- `go` → écrire tous les tests listés
- `ajuste <section>` → reformuler la section concernée et re-présenter
- `ajoute test X` / `retire test Y` → modifier la liste

### 7. Écrire les tests (après validation)

Écrire dans l'ordre :
1. Fichier `.feature` Gherkin (depuis les scenarios du need)
2. Config archi (si applicable)
3. Tests d'archi
4. Squelettes des step definitions (signatures, throw `PendingException`)
5. Tests unitaires ciblés

**Ces tests doivent tous être RED** (ne compilent pas ou échouent). C'est normal : le code n'existe pas encore. `/build` les fera passer en GREEN ensuite.

### 8. Lancer les tests et confirmer qu'ils sont RED

Exécuter `[COMMANDE_TEST]` (depuis `settings.json`). Vérifier :
- Tests d'archi : passent déjà (car pas encore de code à casser) OU échouent avec un message clair
- Tests BDD : échouent avec `PendingException` ou équivalent
- Tests unitaires : échouent car classes/méthodes n'existent pas

Afficher :
```
✅ Tests écrits et RED
  - Archi : [N] règles définies
  - BDD : [N] scenarios, [M] steps à implémenter
  - Unit : [K] tests

🚀 Prochaine étape : @builder pour faire passer les tests (red → green → refactor)
```

### 9. Sync Backlog (OBLIGATOIRE)

Via MCP `backlog` → `task_edit` de l'issue parente :
- Passer le state en `In Progress` si pas déjà fait
- Ajouter dans `## Notes` :
  ```
  [YYYY-MM-DD] /tests-first : tests écrits
  - Archi : [N] règles dans <chemin>
  - BDD : [N] scenarios dans features/<module>/<feature>.feature
  - Unit : [K] tests
  - Tous RED (attendu). /build prend la suite.
  ```
- Mettre à jour le frontmatter du `need.md` du contexte projet : `statut: tests-write` → `statut: code-write` (les tests sont écrits, on attend le code)

Update `context.md` du contexte projet section `## État actuel` :
```
- YYYY-MM-DD : tests écrits pour "<feature>" ([N] scenarios BDD + [M] archi + [K] unit), tous RED, @builder prend la suite
```

## Anti-patterns

- Écrire les tests **après** le code ("test l'implémentation") — c'est du test coverage, pas du BDD.
- Écrire un test unitaire pour chaque classe mécaniquement — **seulement** la logique domain complexe.
- Tests avec `Thread.sleep` ou délais fixes → **refusé**, toujours utiliser des attentes conditionnelles.
- Ignorer les tests d'archi "parce que petit projet" → **non**, ils prennent 10 lignes et évitent de casser la direction des dépendances dès les premiers commits.
- Copier-coller un scenario Gherkin depuis le need sans adapter à la syntaxe du framework cible.
- Mélanger plusieurs features dans un même `.feature` — **une feature = un fichier**.

## Output

```
✅ Tests écrits et RED
📋 Task Backlog mise à jour : statut code-write

Fichiers créés/modifiés :
  - features/<module>/<feature>.feature ([N] scenarios)
  - <path>/ArchTest.<ext> ([M] règles)
  - <path>/steps/<feature>Steps.<ext> ([N] step definitions, PendingException)
  - <path>/<unit>Test.<ext> ([K] tests unitaires)

Config outils :
  - Archi : <outil> configuré dans <fichier config>
  - BDD : <framework> prêt

🚀 Prochaine étape : /build (commit les tests + implémentation RED → GREEN → refactor)
```
