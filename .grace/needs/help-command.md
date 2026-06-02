# Need — Commande /help

**Backlog** : TASK-27 · **Priorité** : High · **Statut** : In Progress

## Contexte

Le bot expose `/ping` et `/config prefix`. Il n'y a aucun moyen pour un utilisateur de découvrir les commandes disponibles. La commande `/help` doit afficher un embed Discord listant toutes les commandes enregistrées avec leur description, de façon dynamique (sans liste hardcodée).

## User Stories

- **P1** En tant qu'utilisateur Discord, je veux taper `/help` afin de voir la liste de toutes les commandes disponibles avec leur description.
- **P2** En tant qu'utilisateur Discord, je veux que la réponse soit éphémère (visible uniquement par moi) afin de ne pas polluer le chat.
- **P2** En tant qu'administrateur, je veux que `/help` reflète automatiquement toute nouvelle commande ajoutée afin de ne pas avoir à mettre à jour un texte statique.

## Acceptance Criteria

```gherkin
Scenario: Affichage de la liste des commandes
  Given le bot est connecté avec 2 commandes enregistrées (ping, config)
  When un utilisateur tape /help
  Then le bot répond avec un embed éphémère
  And l'embed contient une entrée pour chaque commande enregistrée
  And chaque entrée affiche le nom et la description de la commande

Scenario: Réponse éphémère
  Given un utilisateur tape /help dans un canal public
  When la commande s'exécute
  Then la réponse est visible uniquement par l'utilisateur (ephemeral: true)

Scenario: Commande enregistrée dans le CommandRegistry
  Given la HelpCommand est instanciée
  When on lit sa propriété data.name
  Then elle vaut "help"
  And data.description est non vide
```

## Contraintes

- La liste des commandes est lue depuis le `CommandRegistry` (injection — pas de liste hardcodée)
- L'embed utilise `EmbedBuilder` avec couleur cohérente avec `ConfigCommand` (0x5865f2 bleu Discord)
- Titre de l'embed : "Commandes disponibles"
- Chaque commande = un field inline : nom en gras, description en valeur
- Pas de dépendance sur des données BDD (commande pure Interface layer)

## Fichiers impactés

- `src/interface/discord/commands/help.command.ts` (nouveau)
- `src/interface/discord/commands/help.command.test.ts` (nouveau)
- `src/container.ts` (enregistrement de HelpCommand)
- `src/interface/scripts/deploy-commands.ts` (ajout dans la liste)
