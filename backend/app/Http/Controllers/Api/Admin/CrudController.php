<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminFormRequest;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/**
 * Shared list / show / create / update / delete / reorder / toggle behaviour for
 * admin content modules. Concrete controllers declare the model, resource,
 * form request, searchable columns, filters and any relation syncing.
 */
abstract class CrudController extends Controller
{
    /** @var class-string<Model> */
    protected string $model;

    /** @var class-string<JsonResource> */
    protected string $resource;

    /** @var class-string<AdminFormRequest> */
    protected string $request;

    /** Relations eager-loaded for list and detail views. */
    protected array $with = [];

    /** Extra relations loaded only for the detail (edit) view. */
    protected array $withDetail = [];

    /** Relation counts shown in the list. */
    protected array $withCount = [];

    protected array $searchable = ['name'];

    /** query-string key => column for exact-match filters */
    protected array $filters = [];

    protected array $sortable = ['sort_order', 'name', 'created_at', 'updated_at'];

    protected string $defaultSort = 'sort_order';

    /** Boolean columns that can be flipped from the list view. */
    protected array $toggleable = ['is_active', 'is_featured'];

    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'sort' => ['nullable', Rule::in($this->sortable)],
            'direction' => ['nullable', Rule::in(['asc', 'desc'])],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:200'],
        ]);

        $query = $this->model::query()->with($this->with)->withCount($this->withCount);

        $this->applySearch($query, $request->string('search')->toString());

        foreach ($this->filters as $param => $column) {
            if ($request->filled($param)) {
                $query->where($column, $request->input($param));
            }
        }

        $this->scopeIndex($query, $request);

        $sort = $request->input('sort', $this->defaultSort);
        $query->orderBy($sort, $request->input('direction', $sort === 'sort_order' || $sort === 'name' ? 'asc' : 'desc'))
            ->orderBy('id');

        return $this->resource::collection($query->paginate($request->integer('per_page', 25)));
    }

    public function show(int $id): JsonResource
    {
        return new $this->resource($this->find($id)->load($this->withDetail));
    }

    public function store(): JsonResponse
    {
        $request = $this->formRequest();

        $model = DB::transaction(function () use ($request) {
            $model = new $this->model($request->modelAttributes());
            if (in_array('sort_order', $model->getFillable(), true) && ! $request->has('sort_order')) {
                $model->sort_order = (int) $this->model::max('sort_order') + 1;
            }
            $model->save();
            $this->afterSave($model, $request);

            return $model;
        });

        return (new $this->resource($model->load([...$this->with, ...$this->withDetail])))
            ->response()
            ->setStatusCode(201);
    }

    public function update(int $id): JsonResource
    {
        $model = $this->find($id);
        $request = $this->formRequest();

        DB::transaction(function () use ($model, $request) {
            $model->update($request->modelAttributes());
            $this->afterSave($model, $request);
        });

        return new $this->resource($model->refresh()->load([...$this->with, ...$this->withDetail]));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->find($id)->delete();

        return response()->json(['message' => 'Deleted.']);
    }

    /** Persist a new order: ids in the desired sequence. */
    public function reorder(Request $request): JsonResponse
    {
        $ids = $request->validate([
            'ids' => ['required', 'array', 'max:500'],
            'ids.*' => ['integer'],
        ])['ids'];

        DB::transaction(function () use ($ids) {
            foreach ($ids as $position => $id) {
                $this->model::query()->whereKey($id)->first()?->update(['sort_order' => $position]);
            }
        });

        return response()->json(['message' => 'Order saved.']);
    }

    /** Flip a boolean flag (active / featured) from the list view. */
    public function toggle(Request $request, int $id): JsonResource
    {
        $field = $request->validate(['field' => ['required', Rule::in($this->toggleable)]])['field'];
        $model = $this->find($id);
        $model->update([$field => ! $model->{$field}]);

        return new $this->resource($model->load($this->with));
    }

    protected function find(int $id): Model
    {
        return $this->model::query()->with($this->with)->withCount($this->withCount)->findOrFail($id);
    }

    /** Resolving a FormRequest from the container runs its validation. */
    protected function formRequest(): AdminFormRequest
    {
        return app($this->request);
    }

    protected function applySearch(Builder $query, string $term): void
    {
        if ($term === '' || $this->searchable === []) {
            return;
        }

        $like = '%'.addcslashes($term, '%_\\').'%';
        $query->where(function (Builder $q) use ($like) {
            foreach ($this->searchable as $column) {
                $q->orWhere($column, 'like', $like);
            }
        });
    }

    /** Hook for module-specific index constraints. */
    protected function scopeIndex(Builder $query, Request $request): void {}

    /** Hook for syncing relations (galleries, pivots) after create / update. */
    protected function afterSave(Model $model, AdminFormRequest $request): void {}
}
