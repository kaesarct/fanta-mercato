from peewee import (
    SqliteDatabase,
    Model,
    CharField,
    IntegerField,
    ForeignKeyField,
    UUIDField,
    DateTimeField,
)
from datetime import datetime
from uuid import UUID


# Inizializza il database
db = SqliteDatabase("fantacalcio.db")


# Definizione dei modelli
class BaseModel(Model):
    class Meta:
        database = db


class Lega(BaseModel):
    id = UUIDField(primary_key=True, default=UUID)
    nome = CharField(unique=True)


class Squadra(BaseModel):
    id = UUIDField(primary_key=True, default=UUID)
    nome = CharField()
    crediti_rimanenti = IntegerField(default=500)
    num_portieri = IntegerField(default=0)
    num_difensori = IntegerField(default=0)
    num_centrocampisti = IntegerField(default=0)
    num_attaccanti = IntegerField(default=0)
    lega = ForeignKeyField(Lega, backref="squadre")


class Presidente(BaseModel):
    id = UUIDField(primary_key=True, default=UUID)
    email = CharField(unique=True)
    squadra = ForeignKeyField(Squadra, backref="presidenti", null=True)


class Giocatore(BaseModel):
    id = UUIDField(primary_key=True, default=UUID)
    nome = CharField()
    ruolo = CharField()
    crediti = IntegerField(default=1)
    squadra = ForeignKeyField(Squadra, backref="giocatori", null=True)


class Asta(BaseModel):
    id = UUIDField(primary_key=True, default=UUID)
    lega = ForeignKeyField(Lega, backref="aste")
    stato = CharField(default="creata")  # 'creata', 'attiva', 'completata'


class Round(BaseModel):
    id = UUIDField(primary_key=True, default=UUID)
    asta = ForeignKeyField(Asta, backref="rounds")
    data_chiusura = DateTimeField()
    stato = CharField(default="attivo")  # 'attivo', 'completato'


class AstaGiocatore(BaseModel):
    id = UUIDField(primary_key=True, default=UUID)
    round = ForeignKeyField(Round, backref="giocatori_in_asta")
    giocatore = ForeignKeyField(Giocatore, backref="aste")
    offerta_corrente = IntegerField(default=0)
    offerente = ForeignKeyField(Presidente, backref="offerte", null=True)
    data_scadenza = DateTimeField()


def create_tables():
    with db:
        db.create_tables(
            [Lega, Squadra, Presidente, Giocatore, Asta, Round, AstaGiocatore]
        )
