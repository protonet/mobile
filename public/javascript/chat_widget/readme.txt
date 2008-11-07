chat widget:

also das chat widget ist das haupt objekt in dieser applikation, diese verwaltet die shared resources wie users und rooms, messages werde dagegen von dem rooms selbst verwaltet, da sie keine shared resource sind.


beim öffnen der applikation wird ein chatwidget objekt erzeugt, dieses erzeugt und initialisiert seine weiteren sub views:
- den room selector
- den room viewer
- den user listen viewer
- und das input feld

es ist der dreh und angelpunkt für das öffnen und schliessen von räumen, es empfängt die push messages und leitet diese wie nötig weiter.

schauen wir uns nun die einzelnen komponenten der app an:

* der room selector erlaubt es dem user eine liste (horizontal) aller vorhandener räume zu sehen, diese liste beinhaltet mehrere daten, den roomnamen und die anzahl neuer nachrichten. eine auswahl im room selector wird nach der internen arbeit (den richtigen raum in sich selbst zu aktivieren) an das chat widget weitergereicht, dieses kümmert sich dann um den rest. z.zt. max 5 räume in der view (inkl. nachrichten updates)

* der room viewer hält vor allem die aktuellen messages, und kann diese ggf. auch neu laden, es empfängt neue messages vom input feld als auch von der dispatcherfunkionalität des chat widgets, es hält bereits gerendert räume vor und kann sie dadurch innerhalb kürzester zeit rendern... es soll per default nur die letzten 200 nachrichten aus dem backend laden (evtl. user preference).

* der user listen viewer ist dem room viewer ähnlich und hält vor allem die aktuellen user der räume vor, kann diese ggf. neu laden, empfängt seine daten hauptsächlich nach der initialisierung aber auch von der dispatcherfunk. des chat widgets.

* das input feld ist zurzeit noch das simpelste teil der gesamten funktionalität und sendet eingegebenen text einfach an den aktiven raum, sollte daher erst/sofort nach dem setzen dieses aktiviert werden.

Eine neue chatwidget instanz in ihrer initialisierung:

erste komponente die initialisiert wird:

der room selektor: dieser lädt sämtliche dem user verfügbaren räume und speichert sie im chat widget ab (shared resource)... und rendert sich.

die lobby wird geöffnet

öffne user list für diesen raum:
	die user des raumes werden geladen, im chat widget gespeichert, in der liste selbst nur deren ids, und diese liste wird gerendert.

öffne room viewer für diesen raum:
	die messages des raumes werden geladen, in sich selbst gespeichert, dieser raum wird gerendert

initialisiere das input feld
	render dich selbst und sende input an die dir zugeordnete room_id, im allgemeinen die aktive room_id?

”

