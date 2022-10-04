# Prüfungsaufgabe ERCM-System
Laura Moser MIB
WiSe 21/22

Um diesen Code auszuführen wird eine Node.js benötigt.
Nachdem das Repository geklont wurde, müssen folgende Befehle im Terminal ausgeführt werden:

1. npm install
2. npm run build
3. npm run start

Für den UnitTest benötigt man den Befehl: npm run test

Da man sich in diesem System nicht registrieren kann, können diese Eingabedaten verwendet werden 

Admin:

Username: Laura
Passwort: Softwaredesign123!?

User:

Username: Christoph Fleig
Passwort: Softwaredesign12!


## Prüfungsrelevante Informationen über das ERCMSystem:

Die Abkürzung ERCM steht für Enterprise Resource and Customer Management oder auch zu deutsch Waren- und Kundenmanagement.

In diesem System soll es möglich sein Artikel, Kunden und Bestellungen einer Firma zu erfassen und zu verwalten.

Hierbei ist es für die Benutzung der Applikation immer erforderlich sich einzuloggen.
Wichtig: Nur der Administrator kann neue Benutzer hinzufügen. Der Einfachheit halber sollen alle normalen Benutzer die gleichen Berechtigungen haben.
Der Administrator kann allerdings einen Benutzer auch zum Administrator machen, dadurch bekommt dieser mehr Rechte im System, siehe unten.
Jeder Benutzer und Administrator soll sich per Benutzername und Passwort einloggen können. (Benutzername und Passwort können für den Superadmin (also der allererste Admin) hardcoded im Programmcode hinterlegt sein)

Die Rolle des Administrators:

1. Der Administrator kann alles was ein normaler Benutzer auch kann.
2. Nur der Administrator kann neue Benutzer anlegen und deren Rechte ändern, also von Benutzer zu Administrator oder von Administrator zu Benutzer.
    - 2.1.  Ein Benutzer besteht aus einem eindeutigen Benutzernamen, aus einem Passwort und der Angabe, ob dieser ein Administrator ist oder nicht.
3. Nur der Administrator kann neue Artikel anlegen.
    - 3.1.  Ein Artikel besteht immer aus einer eindeutigen ID (numerisch oder alphanumerisch), einer Bezeichnung, dem Datum der Markteinführung, einem Preis in EUR, der Standardlieferzeit, einer minimalen Bestellgröße, 
        einer maximalen Bestellgröße, einer Rabattbestellgröße und dem dazugehörigen Rabatt in %. (per Default können Felder automatisch gesetzt werden, als Beispiel Datum der Markteinführung immer Datum der Anlage oder Standardlieferzeit immer 3 Tage)
        Rabattbestellgröße und Rabatt in % sind keine Pflichtfelder.
      Beispiel Artikel:
        ID: ABC123
        Bezeichnung: Kugelschreiber blau
        ME Datum: 01.01.2022
        Preis: 2,00 €
        Standardlieferzeit: 5 Tage
        min. BG: 50 Stk.
        max. BG: 10.000 Stk.
        Rabatt BG: 5.000 Stk.
        Rabatt in %: 5%

Die Rolle des Benutzers:

1. Der Benutzer kann bestehende Artikel suchen, diese bearbeiten und eine Statistik dafür einsehen.
    - 1.1.  Artikel können anhand der ID oder der Bezeichnung gesucht werden.
    - 2.2.  Jeder Artikel besitzt darüber hinaus eine Artikelstatistik:
        - 2.2.1.  In dieser Statistik wird gespeichert, welcher Artikel in welcher Menge in wieviel Bestellungen schon bestellt wurde.
        - 2.2.2.  Ebenso soll aufgezeigt werden, wie viel Umsatz mit diesem Artikel gemacht wurde.
        - 2.2.3.  Dadurch lässt sich dann auch ein Durchschnitt des Umsatzes pro Bestellung für den Artikel ermitteln.
    - 2.3.  Direkt am Artikel sollen auch Bestellungen erfasst werden können.


2. Der Benutzer kann neue Kunden erstellen bzw. bestehende bearbeiten und ebenso nach diesen anhand der ID oder der Bezeichnung suchen.
    - 2.1.  Ein Kunde besteht aus einer eindeutigen ID (numerisch oder alphanumerisch), einem Namen, der Adresse, seinem Kundenrabatt in %.
    - 2.2.  Jeder Kunde besitzt darüber hinaus eine Kundenstatistik:
        - 2.2.1.  In dieser Statistik wird gespeichert, welche Artikel vom Kunden in welcher Menge bestellt wurden.
        - 2.2.2.  Ebenso soll aufgezeigt werden, wie viel Umsatz mit diesem Kunden gemacht wurde.
        - 2.2.3.  Ebenso soll aufgezeigt werden, wie viel Rabatt dem Kunden auf seine Bestellungen gewährt wurden.
    - 2.3.  Direkt am Kunden sollen auch Bestellungen erfasst werden können.


3. Der Benutzer kann neue Bestellungen erstellen bzw. bestehende bearbeiten und ebenso nach diesen anhand der ID oder der Bezeichnung suchen.
    - 3.1. Eine Bestellung besteht aus einer eindeutigen ID, einem Bestelldatum, dem frühesten Lieferdatum, dem Bestellbetrag in €, dieser ergibt sich durch die
      Bestellpositionen und weiteren Aspekte, die wie folgt sind:
    - 3.2. Eine Bestellung wird immer genau einem Kunden zugeordnet.
    - 3.3. Eine Bestellung besteht aus mehreren Bestellpositionen:
        - 3.3.1.  Eine Bestellposition besteht aus genau einem Artikel, der bestellten Menge (beachten von minimaler und maximaler Bestellgröße des Artikels), dem sich daraus ergebenen Bestellpositionsbetrag (Preis mal Menge)
            Überschreitet die bestellte Menge die Rabattbestellgröße, so soll der Rabatt in % automatisch von dem Bestellpositionsbetrag abgezogen werden.
            Wichtig: Ein Artikel ist erst bestellbar, wenn die Markteinführung schon stattgefunden hat.
    - 3.4. Der Gesamtbestellbetrag ergibt sich durch die einzelnen Bestellpositionen minus Kundenrabatt.
    - 3.5. Das früheste Lieferdatum ist das Datum der Bestellung plus die längeste Standardlieferzeit in den einzelnen Bestellpositionen.
    - 3.6. Am Schluss einer Bestellung soll eine Zusammenfassung der Bestellung ausgegeben werden mit den obengenannten Werten plus dem gesamt gewährten Rabatt.

Bonus: Für eine Firma ist es immens wichtig eine ABC-Analyse über ein Artikel- und Kundenportfolio machen zu können.
Eine Darstellung einer ABC-Analyse über die bestehenden Artikel- und Kundenumsätze wäre hierbei sehr hilfreich:
https://de.wikipedia.org/wiki/ABC-Analyse
