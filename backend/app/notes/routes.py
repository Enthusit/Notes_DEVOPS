from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)
from sqlalchemy.orm import Session

from app.auth.dependencies import (
    get_current_user
)
from app.database.dependencies import (
    get_db
)
from app.models.note import Note
from app.models.user import User
from app.schemas.notes import (
    NoteCreate,
    NoteResponse
)
from app.schemas.notes import (
    NoteCreate,
    NoteResponse,
    NoteUpdate
)


router = APIRouter(
    prefix="/notes",
    tags=["Notes"]
)


@router.post(
    "",
    response_model=NoteResponse,
    status_code=201
)
def create_note(
    payload: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    note = Note(
        title=payload.title,
        content=payload.content,
        owner_id=current_user.id
    )

    db.add(note)
    db.commit()
    db.refresh(note)

    return note


@router.get(
    "",
    response_model=list[NoteResponse]
)
def get_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    notes = db.query(Note).filter(
        Note.owner_id == current_user.id
    ).all()

    return notes


@router.get(
    "/{note_id}",
    response_model=NoteResponse
)
def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    note = db.query(Note).filter(
        Note.id == note_id,
        Note.owner_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    return note
@router.put(
    "/{note_id}",
    response_model=NoteResponse
)
def update_note(
    note_id: int,
    payload: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    note = db.query(Note).filter(
        Note.id == note_id,
        Note.owner_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    note.title = payload.title
    note.content = payload.content

    db.commit()
    db.refresh(note)

    return note
@router.delete(
    "/{note_id}",
    status_code=204
)
def delete_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    note = db.query(Note).filter(
        Note.id == note_id,
        Note.owner_id == current_user.id
    ).first()

    if not note:
        raise HTTPException(
            status_code=404,
            detail="Note not found"
        )

    db.delete(note)
    db.commit()