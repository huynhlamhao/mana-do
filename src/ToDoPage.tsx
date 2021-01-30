import React, { useEffect, useReducer, useRef, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';

import reducer, { initialState } from './store/reducer';
import {
    setTodos,
    createTodo,
    deleteTodo,
    toggleAllTodos,
    deleteAllTodos,
    updateTodoStatus,
    editTodoContent
} from './store/actions';
import Service from './service';
import { TodoStatus } from './models/todo';
import { isTodoCompleted } from './utils';

type EnhanceTodoStatus = TodoStatus | 'ALL';


const ToDoPage = ({ history }: RouteComponentProps) => {
    const [{ todos }, dispatch] = useReducer(reducer, initialState);
    const [showing, setShowing] = useState<EnhanceTodoStatus>('ALL');
    const inputRef = useRef<HTMLInputElement>(null);
    const inputRef1 = useRef<HTMLInputElement>(null);


    useEffect(() => {
        (async () => {
            const resp = await Service.getTodos();
            const localTodo = JSON.parse(localStorage.getItem("localTodos") || "")
            // console.log(todos);

            if (localTodo) {
                dispatch(setTodos(localTodo))
            }
            else {
                dispatch(setTodos(resp || []));
            }
        })()
    }, [todos])

    const onCreateTodo = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputRef.current) {
            try {
                if (inputRef.current.value !== '') {
                    const resp = await Service.createTodo(inputRef.current.value);
                    dispatch(createTodo(resp));
                    inputRef.current.value = '';
                }
                else {
                    alert("You must not leave it blank!")
                }
            } catch (e) {
                if (e.response.status === 401) {
                    history.push('/')
                }
            }
        }
    }

    const onEditTodoContent = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && inputRef1.current) {
            try {
                if (inputRef1.current.value !== '') {
                    dispatch(editTodoContent(e.currentTarget.id, e.currentTarget.value));
                    e.currentTarget.readOnly = true
                }

            } catch (e) {
                if (e.response.status === 401) {
                    history.push('/')
                }
            }
        }

    }
    const onUpdateTodoStatus = (e: React.ChangeEvent<HTMLInputElement>, todoId: string) => {
        dispatch(updateTodoStatus(todoId, e.target.checked))
    }

    const onToggleAllTodo = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(toggleAllTodos(e.target.checked))
    }

    const onDeleteAllTodo = () => {
        dispatch(deleteAllTodos());
    }

    const showTodos = todos.filter((todo) => {
        switch (showing) {
            case TodoStatus.ACTIVE:
                return todo.status === TodoStatus.ACTIVE;
            case TodoStatus.COMPLETED:
                return todo.status === TodoStatus.COMPLETED;
            default:
                return true;
        }
    });

    const activeTodos = todos.reduce(function (accum, todo) {
        return isTodoCompleted(todo) ? accum : accum + 1;
    }, 0);

    return (
        <div className="ToDo__container">
            <h1>TODOS PAGE</h1>
            <div className="Todo__creation">
                <input
                    ref={inputRef}
                    className="Todo__input"
                    placeholder="What need to be done?"
                    onKeyDown={onCreateTodo}
                />
            </div>
            <div className="ToDo__list">
                {
                    showTodos.map((todo, index) => {
                        return (
                            <div key={index} className="ToDo__item">
                                <div className="Todo__item_child">
                                    <input
                                        type="checkbox"
                                        checked={isTodoCompleted(todo)}
                                        onChange={(e) => onUpdateTodoStatus(e, todo.id)}
                                    />
                                    <input
                                        ref={inputRef1}
                                        readOnly
                                        onDoubleClick={(e) => {
                                            e.currentTarget.readOnly = false;
                                            e.currentTarget.selectionStart = e.currentTarget.selectionEnd
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.readOnly = true;
                                            e.currentTarget.value = todo.content
                                        }}
                                        onKeyDown={onEditTodoContent}
                                        type="textArea" defaultValue={todo.content} id={todo.id}
                                    />
                                </div>
                                <button
                                    className="Todo__delete"
                                    onClick={() => {
                                        dispatch(deleteTodo(todo.id))
                                    }}
                                >
                                    X
                                </button>
                            </div>
                        );
                    })
                }
            </div>
            <div className="Todo__toolbar">
                {todos.length > 0 ?
                    <input
                        type="checkbox"
                        checked={activeTodos === 0}
                        onChange={onToggleAllTodo}
                    /> : <div />
                }
                <div className="Todo__tabs">
                    <button className="Action__btn" onClick={() => setShowing('ALL')}>
                        All
                    </button>
                    <button className="Action__btn" onClick={() => setShowing(TodoStatus.ACTIVE)}>
                        Active
                    </button>
                    <button className="Action__btn" onClick={() => setShowing(TodoStatus.COMPLETED)}>
                        Completed
                    </button>
                </div>
                <button className="Action__btn Action__Clear" onClick={onDeleteAllTodo}>
                    Clear all todos
                </button>
            </div>
        </div>
    );
};

export default ToDoPage;