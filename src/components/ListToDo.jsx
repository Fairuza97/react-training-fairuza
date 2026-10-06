
// Import React and selected hooks from the React package
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

// Default tasks
const startList = [
    "Shower",
    "Maghrib prayer",
    "Eat dinner",
    "Watch TV",
];

const ToDoContext = createContext(null);

/* ----------------------- Provider ----------------------- */

function ToDoProvider({ children }) {

    // Active tasks
    const [tasks, setTasks] = useState(() => {
        try {
            const saved = localStorage.getItem("todo-tasks");
            return saved ? JSON.parse(saved) : startList;
        } catch {
            return startList;
        }
    });

    // Completed tasks
    const [completedTasks, setCompletedTasks] = useState(() => {
        try {
            const saved = localStorage.getItem("completed-tasks");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    // New task input
    const [newTask, setNewTask] = useState("");

    // Save active tasks
    useEffect(() => {
        localStorage.setItem(
            "todo-tasks",
            JSON.stringify(tasks)
        );
    }, [tasks]);

    // Save completed tasks
    useEffect(() => {
        localStorage.setItem(
            "completed-tasks",
            JSON.stringify(completedTasks)
        );
    }, [completedTasks]);

    // Log task changes
    useEffect(() => {
        console.log(
            `Tasks changed. Count: ${tasks.length}`
        );

        return () =>
            console.log(
                "Cleaning up before next tasks change..."
            );
    }, [tasks]);

    // Add a new task
    const addTask = () => {
        const t = newTask.trim();

        if (!t) return;

        setTasks((xs) => [...xs, t]);
        setNewTask("");
    };

    // Delete a task
    const deleteTask = (index) => {
        setTasks((xs) =>
            xs.filter((_, i) => i !== index)
        );
    };

    // Complete a task
    // const completeTask = (index) => {
    //     setTasks((xs) => {
    //         const task = xs[index];

    //         // Add task to completed list
    //         setCompletedTasks((completed) => [
    //             ...completed,
    //             task,
    //         ]);

    //         // Remove task from active list
    //         return xs.filter((_, i) => i !== index);
    //     });
    // };
    const completeTask = (index) => {
    const task = tasks[index];

    if (!task) return;

    // Add task to completed list
    setCompletedTasks((completed) => [
        ...completed,
        task,
    ]);

    // Remove task from active list
    setTasks((xs) =>
        xs.filter((_, i) => i !== index)
    );
};

    // Move task up
    const moveTaskUp = (index) =>
        setTasks((xs) => {
            if (index <= 0) return xs;

            const arr = [...xs];

            [arr[index - 1], arr[index]] = [
                arr[index],
                arr[index - 1],
            ];

            return arr;
        });

    // Move task down
    const moveTaskDown = (index) =>
        setTasks((xs) => {
            if (index >= xs.length - 1) return xs;

            const arr = [...xs];

            [arr[index + 1], arr[index]] = [
                arr[index],
                arr[index + 1],
            ];

            return arr;
        });

    // Memoize context value
    const value = useMemo(
        () => ({
            tasks,
            completedTasks,
            newTask,
            setNewTask,
            addTask,
            deleteTask,
            completeTask,
            moveTaskUp,
            moveTaskDown,
        }),
        [
            tasks,
            completedTasks,
            newTask,
        ]
    );

    return (
        <ToDoContext.Provider value={value}>
            {children}
        </ToDoContext.Provider>
    );
}

/* ----------------------- Consumer ----------------------- */

function useToDo() {
    const ctx = useContext(ToDoContext);

    if (!ctx) {
        throw new Error(
            "useToDo must be used inside <ToDoProvider>"
        );
    }

    return ctx;
}

/* ----------------------- New Task Input ----------------------- */

function NewTaskInput() {

    const {
        newTask,
        setNewTask,
        addTask,
    } = useToDo();

    const inputRef = useRef(null);

    // Focus input when component loads
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // Add task when Enter is pressed
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            addTask();
        }
    };

    return (
        <div>
            <input
                ref={inputRef}
                className="newtask"
                type="text"
                value={newTask}
                onChange={(e) =>
                    setNewTask(e.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Enter a new task"
            />

            <button
                className="add-button"
                onClick={addTask}
                title="Add task"
            >
                +
            </button>
        </div>
    );
}

/* ----------------------- Active Task List ----------------------- */

function TaskList() {

    const {
        tasks,
        deleteTask,
        completeTask,
    } = useToDo();

    return (
        <div>

            <h2>Tasks</h2>

            <ol className="todolist">

                {tasks.map((task, index) => (

                    <li
                        key={index}
                        className="task-box"
                    >

                        <span className="text">
                            {task}
                        </span>

                        {/* Delete */}
                        <button
                            className="delete-button"
                            onClick={() =>
                                deleteTask(index)
                            }
                            title="Delete"
                        >
                            x
                        </button>

                        {/* Complete */}
                        <button
                            className="complete-button"
                            onClick={() =>
                                completeTask(index)
                            }
                            title="Complete"
                        >
                            ✓
                        </button>

                        {/* Move up */}
                        {/* <button
                            className="moveup-button"
                            onClick={() =>
                                moveTaskUp(index)
                            }
                            title="Move up"
                        >
                            ↑
                        </button> */}

                        {/* Move down */}
                        {/* <button
                            className="movedown-button"
                            onClick={() =>
                                moveTaskDown(index)
                            }
                            title="Move down"
                        >
                            ↓
                        </button> */}

                    </li>

                ))}

            </ol>

        </div>
    );
}

/* ----------------------- Completed Task List ----------------------- */

function CompletedTaskList() {

    const {
        completedTasks,
    } = useToDo();

    return (
        <div className="completed-section">

            <h2>Completed Tasks</h2>

            {completedTasks.length === 0 ? (

                <p>No completed tasks yet.</p>

            ) : (

                <div className="completed-list">

                    {completedTasks.map(
                        (task, index) => (

                            <div
                                key={index}
                                className="completed-task"
                            >
                                <span>
                                    ✓ {task}
                                </span>
                            </div>

                        )
                    )}

                </div>

            )}

        </div>
    );
}

/* ----------------------- App ----------------------- */

export default function ListToDo() {

    return (
        <ToDoProvider>

            <div>

                <h1>To Do List After Home</h1>

                <NewTaskInput />

                {/* Active tasks */}
                <TaskList />

                {/* Completed tasks */}
                <CompletedTaskList />

            </div>

        </ToDoProvider>
    );
}